{"src/test/resources/features/login_admin_search.feature":"Feature: Automation Flow
  Scenario: Automation Flow
    Given I open the OrangeHRM application
    When I login with username "Admin" and password "admin123"
    And I navigate to Admin section
    And I search for user "Wateen Saud Alzaqdi"
    Then I should see search results","src/test/java/co/com/template/automation/testing/definitions/LoginDefinitions.java":"package co.com.template.automation.testing.definitions;

import io.cucumber.java.en.*;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;
import static co.com.template.automation.testing.tasks.LoginTask.*;
import static co.com.template.automation.testing.tasks.NavigateToAdminTask.*;
import static co.com.template.automation.testing.tasks.SearchUserTask.*;
import static co.com.template.automation.testing.questions.LoginSuccessfulQuestion.*;
import static co.com.template.automation.testing.questions.SearchResultsQuestion.*;

public class LoginDefinitions {
    
    @Given("I open the OrangeHRM application")
    public void iOpenTheApplication() {
        OnStage.setTheStage(new OnlineCast());
        // Navigation handled by StepUrl class
    }
    
    @When("I login with username {string} and password {string}") 
    public void iLoginWithCredentials(String username, String password) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            loginWithCredentials(username, password)
        );
    }
    
    @When("I navigate to Admin section")
    public void iNavigateToAdminSection() {
        OnStage.theActorInTheSpotlight().attemptsTo(
            navigateToAdminSection()
        );
    }
    
    @When("I search for user {string}")
    public void iSearchForUser(String userName) {
        OnStage.theActorInTheSpotlight().attemptsTo(
            searchForUser(userName)
        );
    }
    
    @Then("I should see search results")
    public void iShouldSeeSearchResults() {
        OnStage.theActorInTheSpotlight().should(
            seeThat(searchResultsAreDisplayed())
        );
    }
}","src/main/java/co/com/template/automation/testing/ui/LoginPage.java":"package co.com.template.automation.testing.ui;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

public class LoginPage extends PageObject {
    
    // Username field
    public static final Target USERNAME_FIELD = Target
        .the("username field")
        .locatedBy("input.oxd-input");
    
    // Password field
    public static final Target PASSWORD_FIELD = Target
        .the("password field")
        .locatedBy("input[type='password']");
    
    // Login button
    public static final Target LOGIN_BUTTON = Target
        .the("login button")
        .locatedBy("button.oxd-button");
}","src/main/java/co/com/template/automation/testing/ui/AdminPage.java":"package co.com.template.automation.testing.ui;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;

public class AdminPage extends PageObject {
    
    // Admin menu item
    public static final Target ADMIN_MENU = Target
        .the("admin menu")
        .locatedBy("a.oxd-main-menu-item:has(span:contains('Admin'))");
    
    // Username search field
    public static final Target USERNAME_SEARCH_FIELD = Target
        .the("username search field")
        .locatedBy("input.oxd-input:first-of-type");
    
    // Employee name search
    public static final Target EMPLOYEE_NAME_FIELD = Target
        .the("employee name field")
        .locatedBy("input[placeholder='Type for hints...']");
    
    // Search button
    public static final Target SEARCH_BUTTON = Target
        .the("search button")
        .locatedBy("button.oxd-button:contains('Search')");
}","src/main/java/co/com/template/automation/testing/tasks/LoginTask.java":"package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.*;
import static co.com.template.automation.testing.ui.LoginPage.*;

public class LoginTask {
    
    public static Task loginWithCredentials(String username, String password) {
        return Task.where("{0} logs in with username " + username + " and password " + password,
            Enter.theValue(username).into(USERNAME_FIELD),
            Enter.theValue(password).into(PASSWORD_FIELD),
            Click.on(LOGIN_BUTTON)
        );
    }
}","src/main/java/co/com/template/automation/testing/tasks/NavigateToAdminTask.java":"package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import static co.com.template.automation.testing.ui.AdminPage.*;

public class NavigateToAdminTask {
    
    public static Task navigateToAdminSection() {
        return Task.where("{0} navigates to Admin section",
            Click.on(ADMIN_MENU)
        );
    }
}","src/main/java/co/com/template/automation/testing/tasks/SearchUserTask.java":"package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.*;
import static co.com.template.automation.testing.ui.AdminPage.*;

public class SearchUserTask {
    
    public static Task searchForUser(String userName) {
        return Task.where("{0} searches for user " + userName,
            Enter.theValue(userName).into(USERNAME_SEARCH_FIELD),
            Click.on(SEARCH_BUTTON)
        );
    }
}","src/main/java/co/com/template/automation/testing/questions/LoginSuccessfulQuestion.java":"package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Visibility;
import static co.com.template.automation.testing.ui.AdminPage.*;

public class LoginSuccessfulQuestion {
    
    public static Question<Boolean> isSuccessful() {
        return actor -> Visibility.of(ADMIN_MENU).answeredBy(actor);
    }
}","src/main/java/co/com/template/automation/testing/questions/SearchResultsQuestion.java":"package co.com.template.automation.testing.questions;

import net.serenitybdd.screenplay.Question;
import net.serenitybdd.screenplay.questions.Visibility;
import net.serenitybdd.screenplay.targets.Target;

public class SearchResultsQuestion {
    
    private static final Target RESULTS_TABLE = Target
        .the("results table")
        .locatedBy("div.oxd-table");
    
    public static Question<Boolean> areDisplayed() {
        return actor -> Visibility.of(RESULTS_TABLE).answeredBy(actor);
    }
}","src/test/java/co/com/template/automation/testing/definitions/hooks/Hooks.java":"package co.com.template.automation.testing.definitions.hooks;

import io.cucumber.java.Before;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

public class Hooks {
    
    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }
}"}
