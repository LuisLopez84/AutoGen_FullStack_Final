package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import co.com.template.automation.testing.ui.DaviviendaPago2Page;
import net.serenitybdd.screenplay.actors.OnStage;

public class DaviviendaPago2Question {

    public static Question<String> successMessage() {
        return actor -> OnStage.theActorInTheSpotlight().asksFor(DaviviendaPago2Page.SUCCESS_MESSAGE);
    }

    public static Question<String> errorMessage() {
        return actor -> OnStage.theActorInTheSpotlight().asksFor(DaviviendaPago2Page.ERROR_MESSAGE);
    }
}