/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
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

package io.siddhi.distribution.core.core.internal;


import io.siddhi.distribution.core.core.distribution.DistributionService;
import io.siddhi.distribution.core.core.internal.exception.SiddhiAppAlreadyExistException;
import io.siddhi.distribution.core.core.internal.exception.SiddhiAppConfigurationException;
import io.siddhi.distribution.core.core.internal.exception.SiddhiAppDeploymentException;
import io.siddhi.distribution.core.core.internal.util.SiddhiAppFilesystemInvoker;
import io.siddhi.distribution.core.core.internal.util.SiddhiAppProcessorConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.siddhi.core.SiddhiAppRuntime;
import org.wso2.siddhi.core.SiddhiManager;
import org.wso2.siddhi.core.exception.CannotRestoreSiddhiAppStateException;
import org.wso2.siddhi.core.exception.ConnectionUnavailableException;
import org.wso2.siddhi.core.stream.input.InputHandler;
import org.wso2.siddhi.core.util.transport.BackoffRetryCounter;
import org.wso2.siddhi.query.api.SiddhiApp;
import org.wso2.siddhi.query.api.annotation.Element;
import org.wso2.siddhi.query.api.util.AnnotationHelper;
import org.wso2.siddhi.query.compiler.SiddhiCompiler;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;


/**
 * Class which manage Siddhi Apps.
 */
public class StreamProcessorService {

    private static final Logger log = LoggerFactory.getLogger(StreamProcessorService.class);
    private Map<String, SiddhiAppData> siddhiAppMap = new ConcurrentHashMap<>();
    private BackoffRetryCounter backoffRetryCounter = new BackoffRetryCounter();
    private DistributionService distributionService = StreamProcessorDataHolder.getDistributionService();

    public void deploySiddhiApp(String siddhiAppContent, String siddhiAppName) throws SiddhiAppConfigurationException,
            SiddhiAppAlreadyExistException, ConnectionUnavailableException {

        SiddhiAppData siddhiAppData = new SiddhiAppData(siddhiAppContent);
        boolean persistenceStoreClearEnabled = Boolean.valueOf
                (System.getProperty(SiddhiAppProcessorConstants.PERSISTENCE_STORE_CLEAR_ENABLED));
        String siddhiApp = System.getProperty(SiddhiAppProcessorConstants.SIDDHI_APP);

        if (siddhiAppMap.containsKey(siddhiAppName)) {
            throw new SiddhiAppAlreadyExistException("There is a Siddhi App with name " + siddhiAppName +
                    " is already exist");
        } else {
            SiddhiManager siddhiManager = StreamProcessorDataHolder.getSiddhiManager();
            SiddhiAppRuntime siddhiAppRuntime = siddhiManager.createSiddhiAppRuntime(siddhiAppContent);

            Set<String> streamNames = siddhiAppRuntime.getStreamDefinitionMap().keySet();
            Map<String, InputHandler> inputHandlerMap =
                    new ConcurrentHashMap<String, InputHandler>(streamNames.size());
            for (String streamName : streamNames) {
                inputHandlerMap.put(streamName, siddhiAppRuntime.getInputHandler(streamName));
            }
            if (StreamProcessorDataHolder.isPersistenceEnabled()) {
                log.info("Periodic State persistence enabled. Restoring last persisted state of "
                        + siddhiAppName);
                String revision = null;

                if (persistenceStoreClearEnabled) {
                    if (siddhiApp != null) {
                        if (siddhiApp.equals(siddhiAppName)) {
                            siddhiAppRuntime.clearAllRevisions();
                            log.info("Deleting all the revisions of the Periodic Persistence of " +
                                    "Active Node for " + siddhiAppName);
                        }
                    } else {
                        log.info("Deleting all the revisions of the Periodic Persistence of " +
                                "Active Node for " + siddhiAppName);
                        siddhiAppRuntime.clearAllRevisions();
                    }

                } else {
                    try {
                        revision = siddhiAppRuntime.restoreLastRevision();
                    } catch (CannotRestoreSiddhiAppStateException e) {
                        log.error("Error in restoring Siddhi app " + siddhiAppRuntime.getName(), e);
                    }
                    if (revision != null) {
                        log.info("Siddhi App " + siddhiAppName + " restored to revision " + revision);
                    }
                }
            }
            siddhiAppRuntime.start();
            log.info("Siddhi App " + siddhiAppName + " deployed successfully");
            siddhiAppData.setActive(true);
            siddhiAppData.setSiddhiAppRuntime(siddhiAppRuntime);
            siddhiAppData.setInputHandlerMap(inputHandlerMap);
            siddhiAppData.setDeploymentTime(System.currentTimeMillis());
            siddhiAppMap.put(siddhiAppName, siddhiAppData);
        }
    }

    public void undeploySiddhiApp(String siddhiAppName) {
        if (siddhiAppMap.containsKey(siddhiAppName)) {
            SiddhiAppData siddhiAppData = siddhiAppMap.get(siddhiAppName);
            if (siddhiAppData != null) {
                if (siddhiAppData.isActive()) {
                    siddhiAppData.getSiddhiAppRuntime().shutdown();
                }
            }
            siddhiAppMap.remove(siddhiAppName);
            log.info("Siddhi App File " + siddhiAppName + " undeployed successfully.");
        }
    }

    public boolean delete(String siddhiAppName) throws SiddhiAppConfigurationException,
            SiddhiAppDeploymentException {
        if (siddhiAppMap.containsKey(siddhiAppName)) {
            SiddhiAppFilesystemInvoker.delete(siddhiAppName);
            return true;
        }
        return false;
    }

    public String validateAndSave(String siddhiApp, boolean isUpdate) throws SiddhiAppConfigurationException,
            SiddhiAppDeploymentException {

        String siddhiAppName = "";
        try {
            siddhiAppName = getSiddhiAppName(siddhiApp);
            if (isUpdate || !siddhiAppMap.containsKey(siddhiAppName)) {
                SiddhiManager siddhiManager = StreamProcessorDataHolder.getSiddhiManager();
                SiddhiAppRuntime siddhiAppRuntime = siddhiManager.createSiddhiAppRuntime(siddhiApp);
                if (siddhiAppRuntime != null) {
                    SiddhiAppFilesystemInvoker.save(siddhiApp, siddhiAppName);
                    return siddhiAppName;
                }
            }
        } catch (SiddhiAppDeploymentException e) {
            log.error("Exception occurred when saving Siddhi App : " + siddhiAppName, e);
            throw e;
        } catch (Throwable e) {
            log.error("Exception occurred when validating Siddhi App " + siddhiAppName, e);
            throw new SiddhiAppConfigurationException(e);
        }
        return null;
    }

    public String getSiddhiAppName(String siddhiApp) throws SiddhiAppConfigurationException {
        try {
            SiddhiApp parsedSiddhiApp = SiddhiCompiler.parse(siddhiApp);
            Element nameAnnotation = AnnotationHelper.
                    getAnnotationElement(SiddhiAppProcessorConstants.ANNOTATION_NAME_NAME,
                            null, parsedSiddhiApp.getAnnotations());

            if (nameAnnotation == null || nameAnnotation.getValue().isEmpty()) {
                throw new SiddhiAppConfigurationException("Siddhi App name must " +
                        "be provided as @App:name('name').");
            }

            return nameAnnotation.getValue();

        } catch (Throwable e) {
            throw new SiddhiAppConfigurationException("Exception occurred when retrieving Siddhi App Name ", e);
        }
    }

    public boolean isExists(String siddhiApp) throws SiddhiAppConfigurationException {
        return siddhiAppMap.containsKey(getSiddhiAppName(siddhiApp));
    }

    public void addSiddhiAppFile(String siddhiAppName, SiddhiAppData siddhiAppData) {
        siddhiAppMap.put(siddhiAppName, siddhiAppData);
    }

    public Map<String, SiddhiAppData> getSiddhiAppMap() {
        return siddhiAppMap;
    }
}
