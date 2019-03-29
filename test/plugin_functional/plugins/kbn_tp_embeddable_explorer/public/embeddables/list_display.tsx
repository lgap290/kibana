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
import { Embeddable } from 'plugins/embeddable_api/index';
import React, { Component, Ref, RefObject } from 'react';

import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

interface Props {
  embeddables: Embeddable[];
}

export class ListDisplay extends Component<Props> {
  private roots: Array<RefObject<HTMLDivElement>> = [];

  public constructor(props: Props) {
    super(props);

    this.props.embeddables.forEach(() => {
      this.roots.push(React.createRef());
    });
  }

  public componentDidMount() {
    let i = 0;
    this.props.embeddables.forEach(embeddable => {
      const currentNode = this.roots[i].current;
      if (currentNode) {
        embeddable.renderWithChrome(currentNode);
        i++;
      }
    });
  }

  public componentWillUnmount() {
    this.props.embeddables.forEach(embeddable => embeddable.destroy());
  }

  public renderList() {
    let i = 0;
    const list = this.props.embeddables.map(() => {
      const item = (
        <EuiFlexItem>
          <div style={{ height: '400px' }} ref={this.roots[i]} />
        </EuiFlexItem>
      );
      i++;
      return item;
    });
    return list;
  }

  public render() {
    return (
      <div>
        <h2>A list of Embeddables!</h2>
        <EuiFlexGroup>{this.renderList()}</EuiFlexGroup>
      </div>
    );
  }
}
