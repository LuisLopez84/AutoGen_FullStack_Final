package co.com.template.automation.testing.utils;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class ShadowDomUtils {
    public static WebElement getElementFromShadowRoot(WebDriver driver, String shadowHostSelector, String elementSelector) {
        WebElement shadowHost = driver.findElement(By.cssSelector(shadowHostSelector));
        JavascriptExecutor js = (JavascriptExecutor) driver;
        WebElement shadowRoot = (WebElement) js.executeScript("return arguments[0].shadowRoot", shadowHost);
        return shadowRoot.findElement(By.cssSelector(elementSelector));
    }
}