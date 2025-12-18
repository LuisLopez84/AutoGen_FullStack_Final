package co.com.template.automation.testing.utils;
       import net.serenitybdd.model.environment.EnvironmentSpecificConfiguration;
       import net.thucydides.model.environment.SystemEnvironmentVariables;

       public final class EnvironmentProperties {

       private EnvironmentProperties() {
       // Utility class - private constructor
       }

       public static String getProperty(String propertyName) {
       return EnvironmentSpecificConfiguration.from(
       SystemEnvironmentVariables.createEnvironmentVariables()
       ).getProperty(propertyName);
       }

       public static String getUrl() {
       return getProperty("webdriver.base.url");
       }

       public static String getBrowser() {
       return getProperty("webdriver.driver");
       }

       public static boolean isHeadless() {
       String headless = getProperty("headless.mode");
       return "true".equalsIgnoreCase(headless) || "yes".equalsIgnoreCase(headless);
            }
         }