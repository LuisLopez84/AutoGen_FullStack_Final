package co.com.template.automation.testing.definitions.commons;
    import io.cucumber.java.en.Given;
    import net.serenitybdd.screenplay.actions.Open;
    import net.serenitybdd.screenplay.actors.OnStage;
    public class StepUrl {
        @Given("{string} abre la página web")
        public void abreLaPáginaWeb(String actor) {
            OnStage.theActorCalled(actor);
            OnStage.theActorInTheSpotlight().wasAbleTo(Open.browserOn().thePageNamed("pages.url"));
        }
    }