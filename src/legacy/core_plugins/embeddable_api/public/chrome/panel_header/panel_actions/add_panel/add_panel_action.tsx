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

import { Action, Container, Embeddable } from '../../../../';

import { EuiIcon } from '@elastic/eui';
import React from 'react';
import { openFlyout } from 'ui/flyout';
import { AddPanelFlyout } from './add_panel_flyout';

const ADD_PANEL_ACTION_ID = 'ADD_PANEL_ACTION_ID';

export class AddPanelAction extends Action {
  constructor() {
    super();
    this.id = ADD_PANEL_ACTION_ID;
    this.title = 'Add panel';
    this.priority = 8;
  }

  public allowEditing() {
    return false;
  }

  public isSingleton() {
    return true;
  }

  public getIcon() {
    return <EuiIcon type="pencil" />;
  }

  public execute({ embeddable, container }: { embeddable: Embeddable; container: Container }) {
    if (!embeddable || !container) {
      throw new Error(
        'Customize panel title action requires an embeddable and container as context.'
      );
    }
    openFlyout(<AddPanelFlyout container={container} embeddable={embeddable} />, {
      'data-test-subj': 'samplePanelActionFlyout',
    });
  }
}
