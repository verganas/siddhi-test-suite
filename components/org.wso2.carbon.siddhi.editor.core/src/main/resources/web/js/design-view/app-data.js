/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

define(['require', 'elementArray'],
    function (require, ElementArray) {

        /**
         * @class AppData
         * @constructor
         * @class AppData  Holds the data for given Siddhi app
         */
        var AppData = function () {
            // initiates the collections
            this.streamList = new ElementArray();
            this.tableList = new ElementArray();
            this.windowList = new ElementArray();
            this.triggerList = new ElementArray();
            this.aggregationList = new ElementArray();
            this.windowFilterProjectionQueryList = new ElementArray();
            this.patternQueryList = new ElementArray();
            this.joinQueryList = new ElementArray();
            this.partitionList = new ElementArray();
            this.edgeList = new ElementArray();
            // finalElementCount --> Number of elements that exist on the canvas at the time of saving the model
            this.finalElementCount = 0;

        };

        AppData.prototype.addStream = function (stream) {
            this.streamList.push(stream);
        };

        AppData.prototype.addTable = function (table) {
            this.tableList.push(table);
        };

        AppData.prototype.addWindow = function (window) {
            this.windowList.push(window);
        };

        AppData.prototype.addTrigger = function (trigger) {
            this.triggerList.push(trigger);
        };

        AppData.prototype.addAggregation = function (aggregation) {
            this.aggregationList.push(aggregation);
        };

        AppData.prototype.addWindowFilterProjectionQuery = function (windowFilterProjectionQuery) {
            this.windowFilterProjectionQueryList.push(windowFilterProjectionQuery);
        };

        AppData.prototype.addPatternQuery = function (patternQuery) {
            this.patternQueryList.push(patternQuery);
        };

        AppData.prototype.addJoinQuery = function (joinQuery) {
            this.joinQueryList.push(joinQuery);
        };

        AppData.prototype.addPartition = function (partition) {
            this.partitionList.push(partition);
        };

        AppData.prototype.addEdge = function (edge) {
            this.edgeList.push(edge);
        };

        AppData.prototype.removeStream = function (streamId) {
            this.streamList.removeElement(streamId);
        };

        AppData.prototype.removeTable = function (tableId) {
            this.tableList.removeElement(tableId);
        };

        AppData.prototype.removeWindow = function (windowId) {
            this.windowList.removeElement(windowId);
        };

        AppData.prototype.removeTrigger = function (triggerId) {
            this.triggerList.removeElement(triggerId);
        };

        AppData.prototype.removeAggregation = function (aggregationId) {
            this.aggregationList.removeElement(aggregationId);
        };

        AppData.prototype.removeWindowFilterProjectionQuery = function (windowFilterProjectionQueryId) {
            this.windowFilterProjectionQueryList.removeElement(windowFilterProjectionQueryId);
        };

        AppData.prototype.removePatternQuery = function (patternQueryId) {
            this.patternQueryList.removeElement(patternQueryId);
        };

        AppData.prototype.removeJoinQuery = function (joinQueryId) {
            this.joinQueryList.removeElement(joinQueryId);
        };

        AppData.prototype.removePartition = function (partitionId) {
            this.partitionList.removeElement(partitionId);
        };

        AppData.prototype.removeEdge = function (edgeId) {
            this.edgeList.removeElement(edgeId);
        };

        AppData.prototype.setFinalElementCount = function (finalElementCount) {
            this.finalElementCount = finalElementCount;
        };

        AppData.prototype.getStream = function (streamId) {
            return this.streamList.getElement(streamId);
        };

        AppData.prototype.getTable = function (tableId) {
            return this.tableList.getElement(tableId);
        };

        AppData.prototype.getWindow = function (windowId) {
            return this.windowList.getElement(windowId);
        };

        AppData.prototype.getTrigger = function (triggerId) {
            return this.triggerList.getElement(triggerId);
        };

        AppData.prototype.getAggregation = function (aggregationId) {
            return this.aggregationList.getElement(aggregationId);
        };

        AppData.prototype.getWindowFilterProjectionQuery = function (windowFilterProjectionQueryId) {
            return this.windowFilterProjectionQueryList.getElement(windowFilterProjectionQueryId);
        };

        AppData.prototype.getPatternQuery = function (patternQueryId) {
            return this.patternQueryList.getElement(patternQueryId);
        };

        AppData.prototype.getJoinQuery = function (joinQueryId) {
            return this.joinQueryList.getElement(joinQueryId);
        };

        AppData.prototype.getPartition = function (partitionId) {
            return this.partitionList.getElement(partitionId);
        };

        AppData.prototype.getEdge = function (edgeId) {
            return this.edgeList.getElement(edgeId);
        };

        AppData.prototype.getFinalElementCount = function () {
            return this.finalElementCount;
        };

        return AppData;
    });
