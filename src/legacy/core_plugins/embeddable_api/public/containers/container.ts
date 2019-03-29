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

import { Embeddable, embeddableFactories, EmbeddableInput, EmbeddableOutput } from '../embeddables';
import { ViewMode } from '../types';

export interface PanelState {
  embeddableId: string;
  // The type of embeddable in this panel. Will be used to find the factory in which to
  // load the embeddable.
  type: string;
  customization?: { [key: string]: any };
  initialInput: any;
}

export interface ContainerInput extends EmbeddableInput {
  hidePanelTitles?: boolean;
  panels: {
    [key: string]: PanelState;
  };
}

export interface ContainerOutput extends EmbeddableOutput {
  hidePanelTitles?: boolean;
  viewMode: ViewMode;
  panels: {
    [key: string]: PanelState;
  };
}

export class Container<
  I extends ContainerInput = ContainerInput,
  O extends ContainerOutput = ContainerOutput,
  EI extends EmbeddableInput = EmbeddableInput
> extends Embeddable<I, O> {
  protected readonly embeddables: { [key: string]: Embeddable<EI, EmbeddableOutput> } = {};
  private embeddableUnsubscribes: { [key: string]: () => void } = {};

  constructor(type: string, input: I, output: O) {
    super(type, input, output);

    Object.values(this.input.panels).forEach(panel => this.loadEmbeddable(panel));

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

  public updatePanelState(panelState: PanelState) {
    this.setInput({
      ...this.input,
      panels: {
        ...this.input.panels,
        [panelState.embeddableId]: {
          ...this.input.panels[panelState.embeddableId],
          ...panelState,
        },
      },
    });
  }

  public async loadEmbeddable(panelState: PanelState) {
    this.updatePanelState(panelState);
    const factory = embeddableFactories.getFactoryByName(panelState.type);
    const embeddable = await factory.create(this.getInputForEmbeddable(panelState.embeddableId));
    this.addEmbeddable(embeddable);
  }

  public async addNewEmbeddable(type: string) {
    const factory = embeddableFactories.getFactoryByName(type);
    const embeddable = await factory.create(this.getInputForEmbeddable(panelState.embeddableId));
    this.addEmbeddable(embeddable);
  }

  public createPanelStateForEmbeddable(embeddable: Embeddable): PanelState {
    return {
      type: embeddable.type,
      embeddableId: embeddable.id,
      customization: embeddable.getOutput().customization,
      initialInput: embeddable.getInput(),
    };
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

    embeddable.setInput(this.getInputForEmbeddable(embeddable.id));
    this.embeddables[embeddable.id] = embeddable;
    this.updatePanelState(this.createPanelStateForEmbeddable(embeddable));
  }

  public removeEmbeddable(embeddable: Embeddable<EI, EmbeddableOutput>) {
    this.embeddables[embeddable.id].destroy();
    delete this.embeddables[embeddable.id];

    this.embeddableUnsubscribes[embeddable.id]();

    const changedInput = _.cloneDeep(this.input);
    delete changedInput.panels[embeddable.id];
    this.setInput(changedInput);
  }

  public getInputForEmbeddable(embeddableId: string): EI {
    return {
      id: this.input.panels[embeddableId].embeddableId,
      customization: {
        ...this.input.panels[embeddableId].customization,
      },
      ...this.input.panels[embeddableId].initialInput,
    };
  }

  public getEmbeddable(id: string) {
    return this.embeddables[id];
  }

  private setEmbeddablesInput() {
    Object.values(this.embeddables).forEach((embeddable: Embeddable) => {
      embeddable.setInput(this.getInputForEmbeddable(embeddable.id));
    });
  }
}
