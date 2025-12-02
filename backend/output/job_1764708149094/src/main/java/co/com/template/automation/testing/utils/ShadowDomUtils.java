package co.com.template.automation.testing.utils;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ShadowDomUtils {

    public static WebElement expandShadowRoot(WebDriver driver, WebElement shadowHost) {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        return (WebElement) js.executeScript(
            "return arguments[0].shadowRoot", shadowHost
        );
    }

    public static WebElement findInShadowRoot(WebDriver driver, WebElement shadowHost, String cssSelector) {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        return (WebElement) js.executeScript(
            "return arguments[0].shadowRoot.querySelector(arguments[1])",
            shadowHost, cssSelector
        );
    }
}