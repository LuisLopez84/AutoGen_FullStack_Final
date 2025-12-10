package co.com.template.automation.testing.utils;

    import net.serenitybdd.screenplay.Actor;
    import net.serenitybdd.screenplay.abilities.BrowseTheWeb;
    import net.serenitybdd.screenplay.waits.WaitUntil;
    import org.openqa.selenium.WebDriver;
    import org.openqa.selenium.support.ui.WebDriverWait;
    import java.time.Duration;

    import static net.serenitybdd.screenplay.matchers.WebElementStateMatchers.*;

    public class WaitUtils {

        public static WebDriverWait getWait(Actor actor, int timeoutSeconds) {
            WebDriver driver = BrowseTheWeb.as(actor).getDriver();
            return new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));         }

        public static void waitForPageLoad(Actor actor) {
            getWait(actor, 30).until(driver ->
                ((org.openqa.selenium.JavascriptExecutor) driver)
                    .executeScript("return document.readyState")
                    .equals("complete")
            );
        }

        public static void waitForElementVisibility(Actor actor, net.serenitybdd.screenplay.targets.Target target) {
            actor.attemptsTo(
                WaitUntil.the(target, isVisible()).forNoMoreThan(10).seconds()
            );
        }

        public static void waitForElementClickable(Actor actor, net.serenitybdd.screenplay.targets.Target target) {
            actor.attemptsTo(
                WaitUntil.the(target, isClickable()).forNoMoreThan(10).seconds()
            );
        }
    }