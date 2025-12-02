package co.com.template.automation.testing.tasks;

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
}