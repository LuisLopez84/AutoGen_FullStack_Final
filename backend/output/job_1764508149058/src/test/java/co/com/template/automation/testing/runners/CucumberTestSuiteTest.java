package co.com.template.automation.testing.runners;

import org.junit.platform.suite.api.*;

@IncludeEngines("cucumber")
@SelectClasspathResource("features")
public class CucumberTestSuiteTest {}