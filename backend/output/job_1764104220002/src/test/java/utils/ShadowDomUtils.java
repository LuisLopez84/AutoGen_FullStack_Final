package utils;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class ShadowDomUtils {
    public static WebElement getShadowElement(WebDriver driver, String... selectors) {
        WebElement element = (WebElement) ((JavascriptExecutor) driver).executeScript(
            "return arguments[0].shadowRoot.querySelector(arguments[1]);",
            driver.findElement(By.cssSelector(selectors[0])),
            selectors[1]
        );
        for (int i = 2; i < selectors.length; i++) {
            element = (WebElement) ((JavascriptExecutor) driver).executeScript(
                "return arguments[0].shadowRoot.querySelector(arguments[1]);",
                element,
                selectors[i]
            );
        }
        return element;
    }
}