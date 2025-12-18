package co.com.template.automation.testing.definitions.hooks;

import io.cucumber.java.Before;
import io.cucumber.java.After;
import net.serenitybdd.screenplay.actors.Cast;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.serenitybdd.screenplay.actors.OnlineCast;
import net.thucydides.model.util.EnvironmentVariables;
import net.thucydides.model.environment.SystemEnvironmentVariables;
import org.openqa.selenium.WebDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

       public class Hooks {

           private EnvironmentVariables environmentVariables;

           @Before(order = 1)
           public void setTheStage() {
               OnStage.setTheStage(new OnlineCast());
           }
            @Before(order = 2)
           public void setupDriver() {
               environmentVariables = SystemEnvironmentVariables.createEnvironmentVariables();
               String browser = environmentVariables.getProperty("webdriver.driver", "chrome");
                switch(browser.toLowerCase()) {
                   case "chrome":
                       WebDriverManager.chromedriver().setup();
                       break;
                   case "firefox":
                       WebDriverManager.firefoxdriver().setup();
                       break;
                   case "edge":
                       WebDriverManager.edgedriver().setup();
                       break;
               }
           }

           @After
           public void tearDown() {
               OnStage.drawTheCurtain();
           }
       }