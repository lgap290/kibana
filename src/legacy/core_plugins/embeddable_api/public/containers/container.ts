/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Embeddable, EmbeddableInput, EmbeddableOutput } from '../embeddables';
import { ViewMode } from '../types';

export interface ContainerInput extends EmbeddableInput {
  hidePanelTitles?: boolean;
  panels: {
    [key: string]: {
      customization: { [key: string]: any };
    };
  };
}

export interface ContainerOutput extends EmbeddableOutput {
  hidePanelTitles?: boolean;
  viewMode: ViewMode;
  panels: {
    [key: string]: {
      customization: { [key: string]: any };
    };
  };
}

export abstract class Container<
  I extends ContainerInput = ContainerInput,
  O extends ContainerOutput = ContainerOutput,
  EI extends EmbeddableInput = EmbeddableInput
> extends Embeddable<I, O> {
  protected readonly embeddables: { [key: string]: Embeddable<EI, EmbeddableOutput> } = {};
  private embeddableUnsubscribes: { [key: string]: () => void } = {};

  constructor(config: { type: string; id?: string }, input: I, output: O) {
    super(config, input, output);

    this.subscribeToInputChanges(() => this.setEmbeddablesInput());
  }

  public getEmbeddableCustomization(embeddableId: string) {
    return this.output.panels[embeddableId].customization;
  }

  public getViewMode() {
    return this.input.viewMode ? this.input.viewMode : ViewMode.VIEW;
  }

  public getHidePanelTitles() {
    return this.input.hidePanelTitles ? this.input.hidePanelTitles : false;
  }

  public addEmbeddable(embeddable: Embeddable<EI, EmbeddableOutput>) {
    embeddable.setContainer(this);
    this.embeddableUnsubscribes[embeddable.id] = embeddable.subscribeToOutputChanges(
      (output: EmbeddableOutput) => {
        this.setInput({
          ...this.input,
          panels: {
            ...this.input.panels,
            [embeddable.id]: {
              ...this.input.panels[embeddable.id],
              customization: {
                ...this.input.panels[embeddable.id].customization,
                ...output.customization,
              },
            },
          },
        });
      }
    );

    this.embeddables[embeddable.id] = embeddable;
    embeddable.setInput(this.getInputForEmbeddable(embeddable.id));
  }

  public removeEmbeddable(embeddable: Embeddable<EI, EmbeddableOutput>) {
    this.embeddables[embeddable.id].destroy();
    delete this.embeddables[embeddable.id];

    this.embeddableUnsubscribes[embeddable.id]();

    const changedInput = _.cloneDeep(this.input);
    delete changedInput.panels[embeddable.id];
    this.setInput(changedInput);
  }

  public abstract getInputForEmbeddable(embeddableId: string): EI;

  public getEmbeddable(id: string) {
    return this.embeddables[id];
  }

  private setEmbeddablesInput() {
    Object.values(this.embeddables).forEach((embeddable: Embeddable) => {
      embeddable.setInput(this.getInputForEmbeddable(embeddable.id));
    });
  }
}
