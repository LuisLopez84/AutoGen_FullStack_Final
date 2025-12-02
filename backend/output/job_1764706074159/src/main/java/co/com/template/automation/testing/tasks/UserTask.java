package co.com.template.automation.testing.tasks;

import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.*;
import static co.com.template.automation.testing.ui.AdminPage.*;

public class SearchUserTask {
    
    public static Task searchForUser(String userName) {
        return Task.where("{0} searches for user " + userName,
            Enter.theValue("Admin").into(USERNAME_SEARCH_FIELD),
            Click.on(USER_ROLE_DROPDOWN),
            // Note: Need additional steps to select 'Admin' from dropdown
            Enter.theValue(userName).into(EMPLOYEE_NAME_FIELD),
            Click.on(STATUS_DROPDOWN),
            // Note: Need additional steps to select 'Enabled' from dropdown
            Click.on(SEARCH_BUTTON)
        );
    }
}