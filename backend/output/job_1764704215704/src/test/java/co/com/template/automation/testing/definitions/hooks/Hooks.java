package co.com.template.automation.testing.definitions.hooks;

import io.cucumber.java.Before;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

public class Hooks {
    
    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }
}