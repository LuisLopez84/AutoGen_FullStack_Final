package co.com.template.automation.testing.utils;

import java.io.*;
import java.util.Properties;

public class EnvironmentProperties {
    private Properties properties = new Properties();

    public EnvironmentProperties(String filePath) throws IOException {
        try (InputStream input = new FileInputStream(filePath)) {
            properties.load(input);
        }
    }

    public String getProperty(String key) {
        return properties.getProperty(key);
    }
}