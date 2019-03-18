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

import chrome from 'ui/chrome';
import {
  DASHBOARD_GRID_COLUMN_COUNT,
  DEFAULT_PANEL_HEIGHT,
  DEFAULT_PANEL_WIDTH,
} from '../dashboard_constants';
import { PanelState } from '../types';

/**
 * Represents a panel on a grid. Keeps track of position in the grid and what visualization it
 * contains.
 *
 * @typedef {Object} PanelState
 * @property {number} id - Id of the visualization contained in the panel.
 * @property {string} version - Version of Kibana this panel was created in.
 * @property {string} type - Type of the visualization in the panel.
 * @property {number} panelIndex - Unique id to represent this panel in the grid. Note that this is
 * NOT the index in the panels array. While it may initially represent that, it is not
 * updated with changes in a dashboard, and is simply used as a unique identifier.  The name
 * remains as panelIndex for backward compatibility reasons - changing it can break reporting.
 * @property {Object} gridData
 * @property {number} gridData.w - Width of the panel.
 * @property {number} gridData.h - Height of the panel.
 * @property {number} gridData.x - Column position of the panel.
 * @property {number} gridData.y - Row position of the panel.
 */
