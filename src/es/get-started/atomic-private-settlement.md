---
translation_locale: es
translation_source: /get-started/atomic-private-settlement.md
translation_source_hash: 7f36336e2ddf76514b36aac820246db6a67fb609b97c527e28f0b32c5deb145f
translation_status: machine-validated
translation_engine: bing-translator-llm
---

# Ejecutar liquidación de transacciones financieras privadas atómicas entre espacios de datos {#run-atomic-private-cross-dataspace-settlement}

`AtomicPrivateSettlementV1` coordina una parte confidencial de transferencia financiera en cada uno de 2 a 255 SORA Nexus espacios de datos y finaliza cada parte de transferencia financiera en un estado global transacción. Un paquete rechazado, caducado o abortado no aplica ninguna parte de transferencia financiera. Transparent Native AMX DvP/PvP permanece como un camino de protocolo separado.

::: warning Estado de lanzamiento
Esta función está regulada, deshabilitada por defecto y aún no está calificada para producción. No la habilite para un valor real de CBDC hasta que la funcionalidad publicada, las puertas de privacidad, fallos, rendimiento, compilación-reproducible, revisión-criptográfica-independiente y publicación de artefactos han pasado todas para la versión exacta.
:::

## Lo que oculta el protocolo {#what-the-protocol-hides}

Cada parte de la transferencia financiera utiliza una prueba de nota privada fija de dos entradas y tres salidas. Los validadores del comité verifican la prueba y una transición de estado opaca; no reciben las partes en texto claro, el activo, la cantidad, el memo ni el resultado comercial. Un auditor local autorizado descifra la cápsula de auditoría con relleno, verifica esos contenidos y firma una aprobación separada por propósito. La política predeterminada acepta una aprobación del conjunto de auditores gobernados.

El registro de transacciones y resultados del protocolo de contenedores públicos revela deliberadamente:

- los identificadores de red y de paquete
- rutas del espacio de datos de participantes y recuento de participantes
- temporización y alturas de vencimiento
- identificadores de grupo de datos de protocolo opaco estable, raíces, aniquiladores, valores de compromiso criptográfico y ranuras de texto cifrado fijas
- principios de autorización del comité y disponibilidad exacta de 3 de 4, preparación y certificados de finalización de protocolo
- patrocinador, tarifa de red pública y estado del terminal

Esto es confidencialidad del contenido, no anonimato del flujo de tráfico. El tiempo, el número de participantes, la identidad del espacio de datos y la actividad de la reserva estable permanecen públicos. Un espacio de datos que aloje solo un CBDC también puede hacer que el activo sea deducible a partir de la ruta, aunque no se publique ningún identificador literal del activo.

Cada salida cifrada fija publica un identificador `recipient` derivado de su clave de vista de salida de un solo uso autorizada. Los tres identificadores en una parte de transferencia financiera deben ser distintos; la barrera completa de Preparación y el registro de resultados del protocolo extienden esa verificación a todas las partes de la transferencia financiera. Antes de votar Preparar, cada validador del comité también rechaza un identificador ya presente en WSV finalizado. La finalización global aplica la misma regla a través de la historia del paquete finalizado con un índice de destinatario determinista. El índice está excluido de las cargas útiles de vista de datos en un momento determinado y se reconstruye a partir de salidas cifradas estándar de protocolo únicas durante la restauración, por lo que los duplicados persistidos fallan cerrado. Este es un identificador único y un límite de repetición, no una garantía de que un remitente malicioso o un observador de la red no pueda correlacionar el tráfico antes de la publicación.

## Requisitos de implementación {#deployment-requirements}

Antes de la activación, los operadores necesitan todo lo siguiente:

1. exactamente cuatro validadores por cada espacio de datos participante, con claves de consenso BLS distintas y pruebas de posesión
2. obligatorio Sumeragi DA/RBC habilitado para cada altura
3. un grupo de datos de protocolo de liquidación de transacciones financieras confidenciales gobernado y raíz inicial en cada espacio de datos
4. una capacidad de nota privada activa V1 y el perfil de prueba de liquidación de transacciones financieras separado
5. al menos un `PrivateSettlementAuditPolicyV1` local gobernado, incluyendo firma de auditor distinta y claves de cifrado híbrido, una época de clave, validez de altura y un umbral de aprobación
6. suficiente almacenamiento auxiliar privado de registros para el período de retención configurado
7. una cuenta de patrocinador neutral capaz de enviar la transacción final del contenedor público

Un auditor también puede operar un validador, pero debe usar claves separadas de consenso, de firma del auditor y de cifrado del auditor. Conserve las claves de descifrado fuera de servicio durante el período de retención regulatorio, o gestione y pruebe el reempaquetado de cápsulas antes de retirarlas de servicio.

El principio de autorización de cuatro validadores está anclado al estado, no lo proporciona el cliente. En el `authority_context_height` del manifiesto técnico, cada validador resuelve la lista exacta de carriles/espacios de datos ordenados y la encarnación del carril de ejecución activo a partir del estado de consenso, y requiere que la altura resuelta coincida, y verifica las cuatro llaves BLS y pruebas de posesión. La carga, preparación y el registro final del resultado del protocolo de admisión utilizan todos ese mismo principio de autorización histórica.

La barrera de Preparación, el paquete de finalización del protocolo final y el registro de resultados del protocolo comparten un catálogo principal de autorización compacto de dos niveles. Sus `rosters` contienen identidades de validador sin rutas y pruebas de posesión BLS alineadas. deduplicado en orden de primer uso estándar de protocolo único. `leg_roster_indices[i]` selecciona la lista para la parte de transferencia financiera del manifiesto técnico `i`. El certificado de fase `authority_catalog_index` sigue siendo el ordinal lógico del manifiesto, no el índice de la lista. Antes de la verificación de authority-digest o QC, los validadores combinan la ruta exacta de la parte de transferencia financiera técnica del manifiesto y la encarnación del carril de ejecución activo con la lista seleccionada para reconstruir el `PrivateSettlementCommitteeAuthorityV1` vinculado a la ruta.

## Configurar admisión {#configure-admission}

Todo el comportamiento de producción proviene de la configuración del nodo. Las variables de entorno no pueden activar esta ruta. El valor predeterminado enviado es `enabled = false`; dejar la función deshabilitada no requiere configuración específica de la liquidación.

Después de que la gobernanza haya registrado la capacidad requerida y elegido una altura de activación con aviso adecuado, configure cada nodo relevante de manera consistente:

```toml
[nexus.atomic_private_settlement]
enabled = true
activation_height = 500000
minimum_activation_notice_blocks = 7200
proof_profile_version = 1
max_participants = 255
max_expiry_blocks = 7200
audit_timeout_blocks = 1200
prepare_timeout_blocks = 1200
commit_timeout_blocks = 1200
capsule_padding_classes_bytes = [4096, 16384, 65536, 262144]
max_proof_bytes = 8388608
max_capsule_bytes = 1048576
max_carrier_bytes = 4194304
sidecar_retention_blocks = 1000000
sidecar_max_records = 256
sidecar_max_total_bytes = 3221225472
default_min_auditor_approvals = 1
permitted_policy_versions = [1]
```

El ejemplo utiliza los límites enviados V1, no una recomendación de rendimiento. Mida el almacenamiento, la prueba, la cápsula, la transacción del contenedor y los contenedores de datos de latencia en el hardware previsto antes de elegir los límites operacionales. Los tiempos de espera de tres fases deben encajar dentro de `max_expiry_blocks`, y la retención de registros auxiliares debe ser al menos ese período de expiración.

`max_capsule_bytes` limita la codificación de un solo estándar de protocolo Norito de todo el `PrivateSettlementAuditCapsuleV1`: AAD, valor criptográfico nonce, texto cifrado, enmarcado de vectores, identidades de auditores y cada fila envuelta-DEK. No es un límite solo de texto cifrado. Cada clase de relleno configurada debe ajustarse al contenedor de datos de cápsula completa conservadora para al menos `default_min_auditor_approvals` auditores. Torii también rechaza un nuevo política admitida cuya `min_approvals` está por debajo del piso gobernado, y rechaza cualquier cápsula real cuyo codificación única de protocolo estándar completo sea demasiado grande.

`max_carrier_bytes` limita la transacción completa de un solo protocolo, estándar, firmada por el patrocinador, no solo el paquete certificado. El recuento incluye la instrucción registrada encuadre, principal y metadatos de autorización de transacciones, intención de tarifa y firma. Los límites ordinarios de transacciones de la red siguen aplicándose como un límite superior independiente.

La activación falla en cerrado a menos que la capacidad gobernada esté activa, su estado y alturas de activación cumplan con el período de aviso, el perfil de prueba compilado coincida con V1, y el grupo de datos del protocolo en cadena y los registros de auditoría estén actualizados. Habilitar únicamente la bandera de configuración no es suficiente.

## flujo de trabajo de liquidación de transacciones financieras {#settlement-workflow}

El cliente construye pruebas y cápsulas cifradas localmente. Los testigos secretos deben permanecer en la cartera nativa o en el trabajador nativo; no los serialice en los registros de la aplicación, objetos Python, solicitudes HTTP o registros de coordinación duraderos.

La cápsula y los datos autenticados envueltos por auditor DEK incluyen el valor del resumen criptográfico del comité exactamente anclado al estado y `authority_context_height`, así como la red, la ruta/incarnación, paquete, parte de transferencia financiera, política, época clave y valor de compromiso criptográfico en texto claro. Una clave envuelta no puede ser trasladada a un contexto de lista de autorización histórica o de principal diferente.

Para cada parte de transferencia financiera de protocolo estándar individual, el coordinador luego realiza esta secuencia:

1. Sube el material cifrado provisional a los cuatro validadores y obtén un único certificado de disponibilidad exacto 3-de-4 según el estándar del protocolo.
2. Haga que un auditor autorizado obtenga su cápsula con la solicitud autenticada `POST` descrita a continuación, descífrela, recalcule las vinculaciones públicas, aplique la política local y envíe una aprobación. El acceso a la cápsula después de una rotación de política es solo de retención: un sucesor actual puede autorizar una lectura histórica elegible, pero no puede agregar una aprobación a una parte de transferencia financiera preparada bajo la política antigua.
3. Solicite preparar votos de los cuatro validadores. Cada validador verifica de manera independiente y registra de forma duradera el delta antes de votar. Persista el único certificado Prepare de 3 de 4 estándar del protocolo en cada respondedor registrado.
4. Después de que cada parte de la transferencia financiera tenga un certificado de Preparación, construya la barrera completa de Preparación inmutable. Solicite y guarde certificados de finalización de protocolo únicos de 3 de 4 según el estándar del protocolo. Si el coordinador se reinicia, consulte a los nodos participantes sobre sus certificados de Preparación y finalización de consenso localmente duraderos, seleccione un único certificado equivalente a quórum conforme al protocolo, y redistribúyalo antes de continuar; nunca reconstruya un certificado a partir de una caché local no autenticada.
5. Haga que el patrocinador del manifiesto técnico firme y envíe exactamente una transacción global de contenedor. La transacción del contenedor contiene una instrucción `FinalizeAtomicPrivateSettlementV1` y el paquete certificado completo exacto. Coordinador y WSV miden previamente la instrucción de finalización completamente borrada de tipo, incluyendo el enmarcado de instrucción registrado. Torii y la vinculación de transacción de contenedor de un solo disparo principal hacen cumplir `max_carrier_bytes` sobre la transacción exacta de patrocinador firmada según el estándar de protocolo único, incluyendo el principal de autorización, metadatos, intención de tarifa y firma. Torii rechaza una transacción de contenedor antes de su contexto de principal de autorización, en o después de la última altura de ingreso que podría alcanzar la finalización por vencimiento, o más allá del período de expiración gobernado.
6. Consulta el estado del paquete público y el registro de resultado del protocolo hasta la finalidad global. Trata el estado del registro auxiliar local como provisional hasta que se reconcilie con ese registro terminal global inmutable.

El cliente Rust expone este flujo a través de métodos que incluyen `certify_and_upload_private_settlement_legs_v1`, `prepare_private_settlement_bundle_v1`, `commit_private_settlement_bundle_v1` y `submit_private_settlement_bundle_v1`. La coordinación segura para reinicios utiliza `recover_or_prepare_private_settlement_bundle_v1` y `recover_or_commit_private_settlement_bundle_v1`. Las invocaciones técnicas del comité y del auditor requieren credenciales de rol explícitas; no reutilizan el firmante criptográfico de la cuenta ordinaria.

## Rotar una política de auditor de manera segura {#rotate-an-auditor-policy-safely}

Use la instrucción autorizada por la gobernanza de privacidad `RotatePrivateSettlementPoolPolicyV1`. Debe nombrar el valor exacto del resumen criptográfico actual de la gobernanza, mantener la misma ruta, grupo de datos del protocolo y valor de compromiso criptográfico de vinculación de activos, avanzar la revisión de la gobernanza en uno, utilice una época de clave estrictamente más nueva y diferentes resúmenes criptográficos de políticas/gobernanza, y actívelo en el bloque que contiene la rotación. El grupo de datos del protocolo, fronteras, raíces, anuladores, salidas, se conservan los conjuntos de repetición y los registros de resultados de protocolo finalizados. No incluya un registro de resultado de protocolo que toque la misma ruta/pool en la altura de activación de la rotación; la instrucción rechaza ese límite.

La proyección del grupo de datos del protocolo público conserva toda la línea de sucesión de revisiones de políticas reemplazadas. Por lo tanto, un registro de resultados del protocolo finalizado antes de la rotación sigue siendo válido como evidencia histórica después del reinicio. mientras que la repetición de ese registro exacto de resultados del protocolo se rechaza de manera determinista sin mutación del estado. La línea de sucesión no autoriza trabajo incompleto: cualquier paquete de política antigua que cruce el límite de activación falla cerrado antes de que ocurran cambios en el estado global. Una política sucesora puede autorizar la lectura de una cápsula histórica retenida solo cuando pertenece a la misma línea de políticas con una revisión de gobernanza posterior y una época de clave, y la clave de firma actual autenticada se asigna a la misma identidad de auditor estable en la política histórica y la lista envuelta-DEK. La cápsula permanece cifrada con la clave del auditor histórica: retener esa clave de descifrado histórica exacta para abrirla, o completar un reempaquetado de cápsula gobernado y probado antes de destruir la clave. Este acceso de retención no permite que la política rotada/actual agregue una aprobación bajo la política antigua preparada.

## Torii familia de rutas {#torii-route-family}

Estas rutas utilizan objetos de solicitud y respuesta de protocolo estándar único Norito. Las respuestas autenticadas y restringidas utilizan un comportamiento de caché privado `no-store`.

|Operación|Método y ruta|Principal|
| ------------------ | -------------------------------------------------------------------------- | --------------------------- |
|Subir parte de la transferencia financiera| `POST /v1/nexus/private-settlements/legs`                                  |firma de cuenta estándar de protocolo único|
|Participación de disponibilidad| `POST /v1/nexus/private-settlements/legs/availability-shares`              |firma de cuenta estándar de protocolo único|
|Preparar voto| `POST /v1/nexus/private-settlements/phases/prepare-votes`                  |firma de cuenta estándar de protocolo único|
|votación de la fase de finalización| `POST /v1/nexus/private-settlements/phases/commit-votes`                   |firma de cuenta estándar de protocolo único|
|Fase de persistencia QC| `POST /v1/nexus/private-settlements/phases/certificates`                   |firma de cuenta estándar de protocolo único|
|Fase de recuperación QCs| `GET /v1/nexus/private-settlements/legs/{payload_digest}/phase-certificates` |patrocinador técnico del manifiesto|
|estado de la parte de la transferencia financiera|`GET /v1/nexus/private-settlements/legs/{payload_digest}/status`           |firma de cuenta estándar de protocolo único|
|Prueba del comité| `GET /v1/nexus/private-settlements/legs/{payload_digest}/committee-proof`  |validador de lista exacta|
|Cápsula de auditoría| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-capsule`   |auditor gobernado|
|Aprobación del auditor| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-approvals` |auditor gobernado|
|Enviar final/abortar| `POST /v1/nexus/private-settlements/bundles`                               |patrocinador del manifiesto técnico|
|Estado del paquete| `GET /v1/nexus/private-settlements/bundles/{bundle_id}`                    |pública|
|registro de resultado del protocolo o abortar| `GET /v1/nexus/private-settlements/bundles/{bundle_id}/receipt`            |pública|

El registro de resultados de estado y protocolo público APIs expone únicamente los campos públicos documentados. En particular, el estado de la parte de transferencia financiera ordinaria no revela la aprobación. cuentas o el umbral de auditor gobernado. Las lecturas restringidas colapsan intencionadamente el material faltante, no autorizado y expirado por retención en la misma clase de respuesta no disponible.

La operación de auditoría-cápsula es de solo lectura, vinculada a la identidad `POST`, no a `GET`. Su cuerpo de solicitud firmado Norito JSON es exactamente `{"audit_policy": <PrivateSettlementAuditPolicyV1>}`: la política gobernada completa actual es evidencia para la autorización, no el principal de autorización proporcionado por el cliente. El nodo vincula el `audit_policy` histórico de la cápsula con la revisión de gobernanza efectiva en el `authority_context_height` del manifiesto técnico, vincula la política actual o sucesora solicitada con la revisión efectiva en la altura de lectura autorizada por el nodo, y mapea la clave de firma autenticada a través de la identidad de auditor estable compartida por ambas políticas. La respuesta autenticada refleja el histórico `audit_policy` y la política exacta utilizada para el acceso como `access_audit_policy`, y la declaración del respondedor vincula a ambos. Los clientes deben exigir que `access_audit_policy` sea igual a la política enviada en la solicitud.

La ruta de envío acepta exactamente una instrucción de finalización o aborto firmada directamente por el patrocinador. Su respuesta `202` contiene únicamente el ID del paquete, la altura de admisión observada y el hash criptográfico de la transacción del contenedor; no afirma que un aborto en cola ya sea definitivo. Los SDKs requieren que ambos identificadores sean literales Norito `Hash` JSON de una sola comprobación con estándar de protocolo y que la altura sea un número entero sin signo de 64 bits exacto; Los campos que estén ausentes, adicionales, mal escritos, que no cumplan un solo estándar de protocolo, con suma de verificación inválida, negativos, cero negativo, fraccionarios o desbordados fallan en cerrado. Use el estado del paquete o el registro de resultados del protocolo para un estado terminal autorizado. El código de estado es exacto también: esta ruta de admisión de transacción de contenedor requiere `202`, mientras que cada otra respuesta de éxito de liquidación privada V1 requiere `200`. Los clientes rechazan los códigos alternativos exitosos `2xx` como desviación del contrato sin reflejar el cuerpo de respuesta inesperado a través de errores del cliente. Solo exponen un código de rechazo del servidor cuando coincida con `[A-Za-z0-9_.:-]{1,128}` y descarte los analizadores/causas de validación de la respuesta, evitando que el contenido del cuerpo o los nombres de campo elegidos por el atacante JSON resurjan a través de registros conscientes de la causa.

## Fracaso y recuperación {#failure-and-recovery}

Aprobaciones de auditor faltantes o desactualizadas, menos de tres votos de validadores, raíces o épocas incorrectas, nullificadores duplicados, pruebas o cápsulas sustituidas, financieras no canónicas la transferencia de pedidos parciales, los paquetes caducados y los términos de reembolso no coincidentes fallan todos antes de la mutación global. los certificados de finalización de consenso nunca mutan el estado privado.

Los validadores sincronizan los registros auxiliares, los deltas en etapas y los certificados de fase antes de confirmarlos. Al reiniciar, reconstruyen las reservas a partir de registros duraderos estándar de protocolo único, luego reconcilian registros de resultados globales inmutables del protocolo, marcadores de aborto o vencimiento. El reconciliador supervisado también ejecuta la poda de retención terminal en la altura autorizada observada de manera sincronizada incluso cuando no hay un candidato terminal para conciliar. y falla cerrándose ante un error de poda. Solo un registro terminal global autorizado libera los bloqueos en espera. Tanto la reproducción exacta del registro de resultado del protocolo finalizado como la reproducción conflictiva son rechazadas de manera determinista sin mutación de estado.

La identidad de la reserva incluye la ruta completa. Los encabezados de los grupos de datos de protocolo usan `(route, pool_id, epoch, root)`, los anuladores usan `(route, pool_id, nullifier)`, y las salidas usan `(route, pool_id, commitment)`. Los valores opacos iguales en otra ruta son independientes; una colisión de ruta exacta permanece bloqueada después del reinicio.

Las alertas operativas deben usar solo los campos de paquete opaco, ruta, fase, valor de resumen criptográfico, altura y clase de razón. Nunca coloque cápsulas descifradas, identificadores de cuenta o de activos, cantidades, memorandos, datos de visualización, testigos de prueba o cargas útiles del analizador en registros, eventos, etiquetas de métricas o trazas de seguimiento.

## Calificación antes del valor real {#qualification-before-real-value}

Para la compilación y configuración exacta que pretende implementar, archive evidencia que cubra:

- prueba adversarial, cápsula, política, rotación de claves, reembolso y casos de repetición
- procesos reales de cuatro validadores para 2, 3, 4, 8 y 16 espacios de datos, incluyendo reinicios de validadores y coordinadores, pérdida de mensajes autenticados del 5%, 10% y 20%, particiones de fase, recuperación y fallos en los límites de persistencia
- análisis de fugas diferencial y canario a través de Torii, P2P, bloques, Kura, vistas de datos en un momento específico, consultas, eventos, registros y telemetría
- al menos cinco calentamientos y treinta paquetes medidos por cada participante de la red real, con p50, p95, p99, intervalos de confianza, recursos, tráfico, pruebas y tamaños de registro de resultados del protocolo, y AMX transparente como el control
- pruebas estrictas del espacio de trabajo, verificaciones de lint y formato, semillas aleatorias, soak, compilaciones reproducibles, SBOMs, y hashes criptográficos de artefactos firmados
- ambas capas formales: las verificaciones de simetría de conteo de patas 3/255 y el comité exacto de cuatro validadoras indexadas N=2 centradas en validadoras más el fallo completamente limitado, N=3 fallo primario en papel, N=4 limpio y N=3 configuraciones de expiración/reproducción, con presupuestos de fallo independientes por comité
- revisión independiente de la relación de prueba, selectores de ranura ficticios, vinculaciones de activos y cápsulas, relación de reembolso, criptografía y máquina de estados de espacio de datos cruzado

Publique la evidencia cruda y depurada, el modelo de amenazas, el argumento del protocolo, las limitaciones, los IDs de revisión del código fuente, la descripción del hardware y los informes de auditoría en un artefacto respaldado por DOI inmutable. Las pruebas del repositorio por sí solas no convierten la característica en un sistema de liquidación de transacciones financieras CBDC calificado para producción.

Desde la limpieza final Iroha del registro de salida, genere el inventario de la fuente de la versión y selle en una raíz de paquete preexistente fuera de ese registro de salida:

```sh
python3 scripts/private_settlement_source_evidence.py \
  --repository-root . \
  --bundle-root /absolute/path/to/release-bundle
```

El productor falla en archivos preparados, no preparados, no rastreados o no fusionados y en cualquier cambio de fuente durante la captura. Conserva el objeto de revisión del código fuente en crudo, el inventario de árbol Git de protocolo estándar único, la lista exacta de rutas binarias, el sello determinista de la fuente y `Cargo.lock`; incluya toda declaración de artefacto de su resultado JSON en el manifiesto técnico de la versión final. No renuncia al verificador final del paquete DOI ni a ninguna puerta de lanzamiento externa.

El sello de origen es portátil y falla cerrado: el productor y el verificador final resuelven todo el gráfico de enlaces simbólicos archivados, por lo que un enlace que aparece en la raíz pero se escapa a través de otro enlace, un ciclo, `.git` recorrido o un destino al estilo Windows es rechazado antes de que se creen los enlaces. Los informes estructurados de origen y de puerta se analizan únicamente a partir de archivos estables limitados cuyo valor de resumen criptográfico y longitud coinciden con el manifiesto técnico de la versión, y cada tipo de carga útil de origen debe ocurrir exactamente una vez.

Cada muestra de fallo en bruto y de latencia debe enlazar la revisión completa del código fuente de la versión, el SHA-256 de una descripción de hardware fijada y estructurada, y el SHA-256 de su configuración exacta de número de participantes. Archivar un único manifiesto técnico de configuración estándar de protocolo que cubra N=2,3,4,8,16; cada entrada debe hacer referencia a los bytes de configuración retenidos y afirmar exactamente cuatro validadores por espacio de datos, un quórum de 3 de 4, y obligatorio firmado RS16 DA/RBC. El verificador de versiones rechaza los resúmenes producidos en una compilación, perfil de hardware o configuración de red diferente. Cada pérdida individual, corte de fase y fila de persistencia por fallo debe además nombrar referencias exactas de registros JSONL globalmente no reutilizables dentro de SHA-256-límite. artefactos de controlador autenticado y captura de atomicidad. El verificador de la versión resuelve esos resúmenes criptográficos y requiere que las filas coincidan con la identidad de ejecución, el índice de prueba y los parámetros, el reconocimiento del controlador o el resultado de recuperación, el recuento de verificación continua, y cero observaciones de visibilidad y gastabilidad parciales. Las comparaciones p95/p99 de versiones posteriores también rechazan una línea base firmada cuyo hardware, configuraciones o requisitos de medición difieran del candidato. El verificador final regenera todos los percentiles reportados, MADs, y los intervalos de confianza determinísticos a partir de las muestras crudas archivadas en lugar de confiar en un resumen de referencia separado. También recarga el manifiesto técnico canario y vuelve a escanear de forma independiente cada superficie de privacidad archivada, por lo que un informe no puede suprimir un hallazgo secreto plantado después de volver a enlazar los resúmenes criptográficos de archivos. Cada ejecución solo para secretos debe conservar su pcap de loopback sin filtrar solo para el propietario, stderr de tcpdump en bruto y estadísticas sin pérdidas, manifiesto técnico de puerto estándar de protocolo único, archivo comprimido de fuente restringida y todas las observaciones de atomicidad entre pares. El verificador final vuelve a ejecutar la división de paquetes vinculados al puerto, las proyecciones de origen y las verificaciones de atomicidad de línea base a terminal a partir de esos bytes archivados en lugar de confiar en los resúmenes publicados.

El archivo también debe incluir manifestos técnicos de tráfico contado en pares conforme al estándar de protocolo único y de pares diferenciales que vinculen las rutas de archivo exactas izquierda y derecha, los tipos, las longitudes en bytes y los resúmenes criptográficos SHA-256 para cada superficie de privacidad requerida. Sus raíces declaradas deben contener exactamente el inventario de archivo emparejado. El verificador requiere tamaños de archivos completos iguales y JSON formas públicas para superficies ordinarias. La captura de bucle invertido que lleva entropía y el archivo comprimido de fuente restringida son excepciones de tamaño explícitas; en su lugar, compara el tipo de enlace de los paquetes y las longitudes por paquete, las identidades de fuente restringida y las longitudes de fila de forma fija. Cada solicitud/respuesta Torii, paquete público/restringido P2P, bloque, consulta, evento, registro y recuento de tráfico de telemetría también debe coincidir. Un cambio en la forma del paquete, una fuga estructural del mismo tamaño, una reclamación de procedencia falsa, o un archivo no emparejado no puede ser ocultado reescribiendo el informe de filtración y sus hashes criptográficos.
