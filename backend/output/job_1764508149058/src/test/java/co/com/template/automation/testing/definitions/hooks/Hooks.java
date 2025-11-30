package co.com.template.automation.testing.definitions.hooks;

import io.cucumber.java.*;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

public class Hooks {
    @Before
    public void setUp() {
        OnStage.setTheStage(new OnlineCast());
    }
}