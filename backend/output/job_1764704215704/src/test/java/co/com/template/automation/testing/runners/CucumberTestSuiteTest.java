package co.com.template.automation.testing.runners;
    import io.cucumber.junit.CucumberOptions;
    import net.serenitybdd.cucumber.CucumberWithSerenity;
    import org.junit.runner.RunWith;
    @RunWith(CucumberWithSerenity.class)
    @CucumberOptions(
        plugin = {"pretty", "html:target/cucumber-reports/cucumber.html", "json:target/cucumber-reports/cucumber.json"},
        features = "src/test/resources/features",
        glue = "co.com.template.automation.testing.definitions",
        snippets = CucumberOptions.SnippetType.CAMELCASE
    )
    public class CucumberTestSuiteTest {}