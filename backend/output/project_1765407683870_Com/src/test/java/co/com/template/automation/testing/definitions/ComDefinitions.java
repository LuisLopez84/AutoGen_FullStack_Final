package co.com.template.automation.testing.definitions;

import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.actors.OnStage;
import co.com.template.automation.testing.tasks.SearchForProduct;
import co.com.template.automation.testing.questions.SearchResults;

public class ComDefinitions {
    
    @Given("I am on the Com page")
    public void iAmOnTheComPage() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            // Abrir la página de Mercado Libre
            OpenThePage.ofCom()
        );
    }
    
    @When("I search for a product")
    public void iSearchForAProduct() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            new SearchForProduct("cel")
        );
    }
    
    @Then("I should see the search results")
    public void iShouldSeeTheSearchResults() {
        OnStage.theActorInTheSpotlight().should(
            SeeThat.the(SearchResults.displayed(), isTrue())
        );
    }
}