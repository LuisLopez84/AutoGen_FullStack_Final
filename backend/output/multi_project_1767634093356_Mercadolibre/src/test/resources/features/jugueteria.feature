Feature: Jugueteria Automation

  Scenario: Escenario exitoso - Buscar juguetería
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'jugueteria' en la barra de búsqueda
    Then debe ver una lista de resultados relacionados con 'jugueteria'

  Scenario: Escenario exitoso - Seleccionar un producto
    Given el usuario navega a la página de resultados de búsqueda de 'jugueteria'
    When el usuario selecciona un producto de la lista
    Then debe ser redirigido a la página del producto seleccionado

  Scenario: Escenario de error - Buscar un producto inexistente
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'producto_inexistente' en la barra de búsqueda
    Then debe ver un mensaje indicando que no se encontraron resultados