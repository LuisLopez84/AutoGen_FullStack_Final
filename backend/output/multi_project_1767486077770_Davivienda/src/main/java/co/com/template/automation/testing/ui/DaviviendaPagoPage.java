package co.com.template.automation.testing.ui;

import net.serenitybdd.screenplay.targets.Target;

public class DaviviendaPagoPage {
    public static final Target SERVICIO_ACUEDUCTO = Target.the("Servicio Acueducto La Herradura")
            .locatedBy("h4.ant-list-item-meta-title");
    public static final Target NUMERO_PAPEL = Target.the("Campo número de papel")
            .locatedBy("#numberPaper");
    public static final Target TOTAL_PAGAR = Target.the("Campo total a pagar")
            .locatedBy("#totalPay");
    public static final Target MENSAJE_CONFIRMACION = Target.the("Mensaje de confirmación")
            .locatedBy(".mensaje-confirmacion");
    public static final Target MENSAJE_ERROR = Target.the("Mensaje de error")
            .locatedBy(".mensaje-error");
}