package co.com.template.automation.testing.runners;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    plugin = {
        "pretty",
        "html:target/cucumber-reports/cucumber.html",
        "json:target/cucumber-reports/cucumber.json",
        "timeline:target/cucumber-reports/timeline"
    },
    features = {
      "classpath:features/camisetas.feature",
      "classpath:features/jugueteria.feature",
      "classpath:features/reloj.feature",
      "classpath:features/vehiculos.feature",
    },
    glue = {
        "co.com.template.automation.testing.definitions",
        "co.com.template.automation.testing.definitions.commons",
        "co.com.template.automation.testing.definitions.hooks"
    },
    snippets = CucumberOptions.SnippetType.CAMELCASE,
    tags = "@regression"
)
public class CucumberTestSuiteTest {
}