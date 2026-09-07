---
translation_locale: pt
translation_source: /get-started/atomic-private-settlement.md
translation_source_hash: 7f36336e2ddf76514b36aac820246db6a67fb609b97c527e28f0b32c5deb145f
translation_status: machine-validated
translation_engine: bing-translator-llm
---

# Executar liquidação de transações financeiras privadas atômicas entre espaços de dados {#run-atomic-private-cross-dataspace-settlement}

`AtomicPrivateSettlementV1` coordena uma parte confidencial da transferência financeira em cada um dos 2 a 255 SORA Nexus espaços de dados e finaliza cada parte da transferência financeira em um estado global transação. Um pacote rejeitado, expirado ou abortado não aplica nenhuma parte de transferência financeira. O Nativo Transparente AMX DvP/PvP permanece um caminho de protocolo separado.

::: warning Status de lançamento
Este recurso é regulamentado, desativado por padrão e ainda não qualificado para produção. Não o ative para valor real de CBDC até que a funcionalidade publicada privacidade, falha, desempenho, build-reproduzível, revisão-criptográfica-independente e publicação de artefatos, todos os critérios foram atendidos para o lançamento exato.
:::

## O que o protocolo esconde {#what-the-protocol-hides}

Cada parte da transferência financeira utiliza uma prova de nota privada fixa com duas entradas e três saídas. Os validadores do comitê verificam a prova e uma transição de estado opaca; eles não recebem os participantes em texto simples, ativo, valor, memorando ou resultado comercial. Um auditor local autorizado descriptografa a cápsula de auditoria preenchida, verifica seu conteúdo e assina uma aprovação separada por finalidade. A política padrão aceita uma aprovação do conjunto de auditores governados.

O registro público de transações de contêiner e resultados de protocolo revela deliberadamente:

- os identificadores de rede e de pacote
- rotas de espaço de dados do participante e contagem de participantes
- tempos e alturas de expiração
- identificadores de grupo de dados de protocolo opaco estável, raízes, nulificadores, valores de compromisso criptográfico e slots de texto cifrado fixos
- princípios de autorização do comitê e disponibilidade exata de 3 em 4, preparar e certificados de finalização de protocolo
- patrocinador, taxa de rede pública e status do terminal

Esta é a confidencialidade do conteúdo, não o anonimato do fluxo de tráfego. Tempo, contagem de participantes, identidade do espaço de dados e atividade do pool estável permanecem públicos. Um espaço de dados que hospeda apenas um CBDC também pode tornar o ativo inferível a partir da rota, mesmo que nenhum identificador literal do ativo seja publicado.

Cada saída fixa criptografada publica um identificador `recipient` derivado de sua chave autorizada de visualização de saída única. Os três identificadores em uma parte de transferência financeira devem ser distintos; a barreira completa do Prepare e o registro de resultado do protocolo estendem essa verificação por todas as partes da transferência financeira. Antes de votar Preparar, cada validador do comitê também rejeita um identificador já presente em WSV finalizado. A finalização global aplica a mesma regra em todo o histórico de pacotes finalizados com um índice de destinatário determinístico. O índice é excluído dos payloads de visualização de dados em determinado ponto no tempo e reconstruído a partir de saídas criptografadas únicas de padrão de protocolo durante a restauração, de modo que duplicatas persistidas falham fechadas. Este é um identificador único e um limite de repetição, não uma garantia de que um remetente malicioso ou observador de rede não possa correlacionar o tráfego antes da publicação.

## Requisitos de implantação {#deployment-requirements}

Antes da ativação, os operadores precisam de todos os seguintes:

1. exatamente quatro validadores para cada espaço de dados participante, com chaves de consenso BLS distintas e provas de posse
2. obrigatório Sumeragi DA/RBC ativado para cada altura
3. um grupo de dados de protocolo de liquidação de transações financeiras confidenciais governado e raiz inicial em cada espaço de dados
4. uma capacidade de nota privada V1 ativa e o perfil separado de prova de liquidação de transação financeira
5. pelo menos um `PrivateSettlementAuditPolicyV1` local governado, incluindo assinatura de auditor distinta e chaves de criptografia híbrida, uma época de chave, validade de altura e um limite de aprovação
6. armazenamento auxiliar privado suficiente para o período de retenção configurado
7. uma conta de patrocinador neutra capaz de enviar a transação final do contêiner público

Um auditor também pode operar um validador, mas deve usar chaves separadas de consenso, assinatura de auditor e criptografia do auditor. Mantenha as chaves de criptografia desativadas pelo período de retenção regulamentar, ou governe e teste o reembalamento da cápsula antes de desativá-las.

O princípio de autorização de quatro validadores é ancorado no estado, não fornecido pelo cliente. No `authority_context_height` do manifesto técnico, cada validador resolve a lista de faixa/espaço de dados ordenada exata e a encarnação da faixa de execução ativa a partir do estado de consenso, exigindo que a altura resolvida corresponda, e verifica as quatro chaves BLS e comprovações de posse. Upload, Preparar e registro final do protocolo usam o mesmo princípio de autorização histórica.

A barreira Prepare, o pacote de finalização do protocolo final e o registro de resultados do protocolo compartilham um catálogo principal de autorização compacto de dois níveis. Seus `rosters` contêm identidades de validadores sem rota e BLS provas de posse alinhadas, deduplicado na ordem de primeiro uso de protocolo padrão único. `leg_roster_indices[i]` seleciona a lista para a parte de transferência financeira do manifesto técnico `i`. O certificado de fase `authority_catalog_index` permanece o ordinal do manifesto lógico, não o índice da lista. Antes da digestão pela autoridade ou verificação QC, os validadores combinam a rota exata dessa parte técnica do manifesto de transferência financeira e a encarnação da linha de execução ativa com a lista selecionada para reconstruir o `PrivateSettlementCommitteeAuthorityV1` vinculado à rota.

## Configurar admissão {#configure-admission}

Todo comportamento de produção vem da configuração do nó. Variáveis de ambiente não podem ativar esse caminho. O padrão fornecido é `enabled = false`; deixar o recurso desativado não requer configuração específica do estabelecimento.

Depois que a governança registrar a capacidade necessária e escolher uma altura de ativação com aviso adequado, configure cada nó relevante de forma consistente:

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

O exemplo usa os limites V1 fornecidos, não uma recomendação de desempenho. Meça armazenamento, prova, cápsula, transação de contêiner e dados de latência em contêineres de dados no hardware pretendido antes de escolher os limites operacionais. Os três tempos limite de fase devem caber dentro de `max_expiry_blocks`, e a retenção de registros auxiliares deve ser pelo menos igual à janela de expiração.

`max_capsule_bytes` limita a codificação única do protocolo-padrão Norito de todo o `PrivateSettlementAuditCapsuleV1`: AAD, valor do nonce criptográfico, texto cifrado, enquadramento de vetor, identidades de auditor e cada linha envolvida-DEK. Não é um limite apenas de texto cifrado. Cada classe de preenchimento configurada deve se ajustar ao recipiente de dados de cápsula inteira conservadora para pelo menos `default_min_auditor_approvals` auditores. Torii também rejeita um novo política admitida cuja `min_approvals` está abaixo do limite regulado, e rejeita qualquer cápsula real cuja codificação padrão de protocolo único completa seja muito grande.

`max_carrier_bytes` limita a transação completa de protocolo único padrão assinada pelo patrocinador, não apenas o pacote certificado. A contagem inclui a instrução registrada estruturação, principal e metadados de autorização de transação, intenção de taxa e assinatura. Os limites de transação comuns da rede ainda se aplicam como um limite superior independente.

A ativação falha fechada, a menos que a capacidade governada esteja ativa, seu estado e alturas de ativação satisfaçam o período de aviso, o perfil de prova compilado corresponda a V1, e o grupo de dados do protocolo on-chain e os registros de auditoria estejam atualizados. Apenas habilitar a bandeira de configuração não é suficiente.

## fluxo de trabalho de liquidação de transações financeiras {#settlement-workflow}

O cliente constrói provas e cápsulas criptografadas localmente. Testemunhas secretas devem permanecer na carteira nativa ou no trabalhador nativo; não as serialize nos logs da aplicação, objetos Python, solicitações HTTP ou registros de coordenação duráveis.

Os dados autenticados encapsulados e por auditor DEK-wrap incluem o valor do resumo criptográfico do comitê exatamente ancorado ao estado e `authority_context_height`, bem como a rede, rota/incarnação, pacote, parte da transferência financeira, política, época-chave e valor de compromisso criptográfico em texto simples. Uma chave encapsulada não pode ser movida para um registro diferente ou contexto de principal de autorização histórica.

Para cada parte única de transferência financeira padrão de protocolo, o coordenador então realiza esta sequência:

1. Carregue o material criptografado provisório nos quatro validadores e obtenha um único certificado de disponibilidade exato 3-de-4 conforme o padrão do protocolo.
2. Faça com que um auditor autorizado busque sua cápsula com a solicitação autenticada `POST` descrita abaixo, descriptografe-a, recalcule as ligações públicas, aplique a política local e envie uma aprovação. O acesso à cápsula após uma rotação de política é apenas de retenção: um sucessor atual pode autorizar uma leitura histórica elegível, mas não pode adicionar uma aprovação a uma parte de transferência financeira preparada sob a política antiga.
3. Solicitar a Preparação dos votos dos quatro validadores. Cada validador verifica de forma independente e prepara de forma duradoura o delta antes de votar. Persistir o único certificado Prepare do protocolo padrão 3-de-4 em cada respondedores preparado.
4. Após cada parte de transferência financeira ter um certificado Prepare, construa a barreira Prepare completa imutável. Solicite e persista certificados de finalização de protocolo padrão 3-de-4 de protocolo único. Se o coordenador reiniciar, consulte os nós participantes sobre seus certificados de Preparação e finalização de consenso localmente duráveis, selecione um único certificado equivalente a quórum padrão do protocolo e redistribua-o antes de continuar; nunca reconstrua um certificado a partir de um cache local não autenticado.
5. Faça com que o patrocinador do manifesto técnico assine e envie exatamente uma transação de contêiner global. A transação de contêiner contém uma instrução `FinalizeAtomicPrivateSettlementV1` e o pacote certificado completo exato. Coordenador e WSV medem de antemão a instrução de finalização completamente apagada do tipo, incluindo a estrutura de instrução registrada. Torii e a vinculação de transação do contêiner one-shot principal aplicam `max_carrier_bytes` sobre a transação assinada pelo patrocinador com protocolo padrão único exato, incluindo autorização principal, metadados, intenção de taxa e assinatura. Torii rejeita uma transação de contêiner antes de seu contexto de autorização principal, no ou após a última altura de ingresso que poderia alcançar a finalização por expiração, ou além do período de expiração governado.
6. Consulte o status do pacote público e o registro de resultado do protocolo até a finalidade global. Trate o estado do registro auxiliar local como provisório até que ele se reconcilie com aquele registro terminal global imutável.

O cliente Rust expõe este fluxo através de métodos incluindo `certify_and_upload_private_settlement_legs_v1`, `prepare_private_settlement_bundle_v1`, `commit_private_settlement_bundle_v1` e `submit_private_settlement_bundle_v1`. A coordenação segura para reinício utiliza `recover_or_prepare_private_settlement_bundle_v1` e `recover_or_commit_private_settlement_bundle_v1`. As invocações técnicas do comitê e do auditor exigem credenciais de função explícitas; elas não reutilizam o signatário criptográfico da conta comum.

## Gire uma política de auditor com segurança {#rotate-an-auditor-policy-safely}

Use a instrução privacy-governance-authorized `RotatePrivateSettlementPoolPolicyV1`. Deve nomear o valor exato do digest criptográfico de governança atual, manter a mesma rota, grupo de dados de protocolo e valor de compromisso criptográfico de vinculação de ativos, avançar a revisão de governança em um, use uma época de chave estritamente mais recente e diferentes resumos criptográficos de política/governança, e ative no bloco que contém a rotação. O grupo de dados do protocolo, fronteiras, raízes, anuladores, saídas, conjuntos de repetição, e os registros de resultado de protocolo finalizados são preservados. Não inclua um registro de resultado de protocolo que toque a mesma rota/pool na altura de ativação da rotação; a instrução rejeita esse limite.

A projeção do grupo de dados do protocolo público mantém a linhagem completa de revisões de políticas substituídas. Um registro de resultado do protocolo finalizado antes da rotação, portanto, permanece válido como evidência histórica após a reinicialização. enquanto reproduzir esse registro exato de resultado do protocolo é rejeitado de forma determinística sem mutação de estado. A linhagem não autoriza trabalho inacabado: qualquer pacote de política antiga que cruze a fronteira de ativação falha de forma definitiva antes das alterações no estado global. Uma política sucessora pode autorizar a leitura de uma cápsula histórica retida apenas quando ela pertence à mesma linhagem de políticas com uma revisão de governança posterior e época de chave. e a chave de assinatura atual autenticada corresponde à mesma identidade de auditor estável na política histórica e na lista encapsulada-DEK. A cápsula permanece criptografada para a chave do auditor histórico: reter exatamente essa chave de descriptografia histórica para abri-la, ou completar um reempacotamento de cápsula governado e testado antes de destruir a chave. Esse acesso de retenção não permite que a política rotacionada/atual adicione uma aprovação sob a política antiga preparada.

## Torii família de rotas {#torii-route-family}

Essas rotas usam objetos de solicitação e resposta de padrão único de protocolo Norito. Respostas autenticadas e restritas utilizam comportamento de cache privado `no-store`.

|Operação          |Método e caminho|Principal|
| ------------------ | -------------------------------------------------------------------------- | --------------------------- |
|Carregar parte da transferência financeira| `POST /v1/nexus/private-settlements/legs`                                  |assinatura de conta de protocolo único|
|Compartilhamento de disponibilidade| `POST /v1/nexus/private-settlements/legs/availability-shares`              |assinatura de conta de protocolo único|
|Preparar voto| `POST /v1/nexus/private-settlements/phases/prepare-votes`                  |assinatura de conta de protocolo único padrão|
|votação da fase de finalização| `POST /v1/nexus/private-settlements/phases/commit-votes`                   |assinatura de conta de protocolo único|
|Persistir fase QC| `POST /v1/nexus/private-settlements/phases/certificates`                   |assinatura de conta de protocolo único|
|Fase de recuperação QCs| `GET /v1/nexus/private-settlements/legs/{payload_digest}/phase-certificates` |patrocinador técnico de manifesto|
|status da parte da transferência financeira| `GET /v1/nexus/private-settlements/legs/{payload_digest}/status`           |assinatura de conta de protocolo único padrão|
|Prova do comitê| `GET /v1/nexus/private-settlements/legs/{payload_digest}/committee-proof`  |validador de lista exata|
|Cápsula de auditoria| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-capsule`   |auditor governado|
|Aprovação do auditor| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-approvals` |auditor governado|
|Enviar final/abort| `POST /v1/nexus/private-settlements/bundles`                               |patrocinador técnico de manifesto|
|Status do pacote| `GET /v1/nexus/private-settlements/bundles/{bundle_id}`                    |público|
|registro de resultado de protocolo ou abortar| `GET /v1/nexus/private-settlements/bundles/{bundle_id}/receipt`            |público                      |

O registro de status público e resultado do protocolo APIs expõe apenas os campos públicos documentados. Em particular, o status de parte de transferência financeira comum não revela aprovação contagens ou o limite do auditor governado. Leituras restritas colapsam intencionalmente materiais ausentes, não autorizados e expirados por retenção na mesma classe de resposta indisponível.

A operação de audit-capsule é de leitura apenas, vinculada à identidade `POST`, não é uma `GET`. Seu corpo de solicitação assinado Norito JSON é exatamente `{"audit_policy": <PrivateSettlementAuditPolicyV1>}`: a política atual completa governada é a evidência para autorização, não o principal de autorização fornecido pelo cliente. O nó vincula o `audit_policy` histórico da cápsula à revisão de governança vigente no `authority_context_height` do manifesto técnico, vincula a política atual ou sucessora solicitada à revisão vigente na altura de leitura autoritativa do nó, e mapeia a chave de assinatura autenticada através da identidade de auditor estável compartilhada por ambas as políticas. A resposta autenticada reflete o histórico `audit_policy` e a política exata usada para acesso como `access_audit_policy`, e a certificação do respondedor vincula ambos. Os clientes devem exigir que `access_audit_policy` seja igual à política enviada na solicitação.

A rota de envio aceita exatamente uma instrução de finalização ou abortamento assinada pelo patrocinador direto. Sua resposta `202` contém apenas o ID do pacote, a altura de admissão observada e o hash criptográfico da transação do contêiner; não afirma que um abortamento em espera já esteja finalizado. Os SDKs exigem que ambos os identificadores sejam literais Norito `Hash` JSON com soma de verificação padrão de protocolo e que a altura seja um inteiro sem sinal de 64 bits exato; campos ausentes, adicionais, digitados incorretamente, fora do padrão de protocolo único, com soma de verificação inválida, negativos, zero-negativos, fracionários ou com estouro falham de forma segura. Use o status do pacote ou o registro de resultado do protocolo para o estado terminal autorizado. O código de status é exato também: esta rota de admissão de transação de contêiner requer `202`, enquanto toda outra resposta de sucesso de liquidação privada V1 requer `200`. Os clientes rejeitam códigos alternativos bem-sucedidos `2xx` como desvio de contrato sem refletir o corpo de resposta inesperado através de erros do cliente. Eles expõem apenas um código de rejeição do servidor quando corresponder a `[A-Za-z0-9_.:-]{1,128}` e descartar causas do analisador/validação de respostas, evitando que o conteúdo do corpo ou nomes de campo JSON escolhidos pelo atacante reapareçam através de logs conscientes da causa.

## Falha e recuperação {#failure-and-recovery}

Aprovações de auditor ausentes ou desatualizadas, menos de três votos de validadores, raízes ou épocas erradas, nulificadores duplicados, provas ou cápsulas substituídas, financeiro não canônico transferir pedido parcial, pacotes expirados e termos de reembolso incompatíveis todos falham antes da mutação global. certificados de finalização de consenso nunca mudam o estado privado.

Os validadores sincronizam os registros auxiliares, deltas em estágio e certificados de fase antes de reconhecê-los. Ao reiniciar, eles reconstruem reservas a partir de registros duráveis individuais conforme o padrão do protocolo e, em seguida, reconciliam registros imutáveis de resultados globais do protocolo, marcadores de aborto ou expiração. O reconciliador supervisionado também executa a poda de retenção terminal na altura autorizada observada de forma síncrona, mesmo quando não há um candidato terminal para reconciliar, e ele falha fechado em um erro de poda. Apenas um registro terminal global autorizado libera bloqueios em estágio. O replay do registro de resultado de protocolo finalizado exato e o replay conflitante são ambos rejeitados de forma determinística sem mutação de estado.

A identidade da reserva inclui a rota completa. cabeçalhos de grupo de dados de protocolo usam `(route, pool_id, epoch, root)`, anuladores usam `(route, pool_id, nullifier)` e saídas usam `(route, pool_id, commitment)`. Valores opacos iguais em outra rota são independentes; uma colisão de rota exata permanece bloqueada após a reinicialização.

Alertas operacionais devem usar apenas os campos de pacote opaco, rota, fase, valor de resumo criptográfico, altura e classe de motivo. Nunca coloque cápsulas descriptografadas, identificadores de conta ou ativo, valores, memorandos, dados de visualização, testemunhas de prova ou cargas úteis de analisador em registros, eventos, rótulos de métricas ou intervalos de rastreamento.

## Qualificação antes do valor real {#qualification-before-real-value}

Para a construção e configuração exatas que você pretende implantar, arquive evidências que cubram:

- prova adversarial, cápsula, política, rotação de chaves, reembolso e casos de repetição
- processos reais de quatro validadores para 2, 3, 4, 8 e 16 espaços de dados, incluindo reinicializações de validadores e coordenadores, perda de mensagens autenticada de 5%, 10% e 20%, partições de fase, recuperação e falhas no limite de persistência
- análise de vazamento canário e diferencial através de Torii, P2P, blocos, Kura, visualizações de dados em um ponto no tempo, consultas, eventos, registros e telemetria
- pelo menos cinco aquecimentos e trinta pacotes medidos por contagem de participantes da rede real, com p50, p95, p99, intervalos de confiança, recursos, tráfego, tamanhos de registro de prova e resultado do protocolo, e AMX transparente como o controle
- testes rigorosos de espaço de trabalho, verificação de lint e formatação, sementes aleatórias, soak, builds reproduzíveis, SBOMs e hashes criptográficos de artefatos assinados
- ambas as camadas formais: as verificações de simetria de contagem das 3/255 partes e a configuração precisa do comitê de quatro validadores indexados N=2 focados em validadores mais falhas totalmente limitadas, falha principal de papel N=3, N=4 limpa e N=3 de expiração/replay, com orçamentos de falha independentes por comitê
- revisão independente da relação de prova, seletores de slot fictício, vinculações de ativos e cápsulas, relação de reembolso, criptografia e máquina de estado entre espaços de dados

Publique as evidências brutas e saneadas, o modelo de ameaça, o argumento do protocolo, as limitações, os IDs de revisão do código-fonte, a descrição do hardware e os relatórios de auditoria em um artefato imutável DOI-suportado. Apenas os testes de repositório não transformam o recurso em um sistema de liquidação de transações financeiras CBDC qualificado para produção.

A partir do checkout final limpo Iroha, gere o inventário da fonte de lançamento e sele dentro de um root de pacote pré-existente fora desse checkout:

```sh
python3 scripts/private_settlement_source_evidence.py \
  --repository-root . \
  --bundle-root /absolute/path/to/release-bundle
```

O produtor falha em arquivos staged, unstaged, untracked ou unmerged e em qualquer alteração de fonte durante a captura. Ele retém o objeto de revisão do código-fonte bruto, inventário de árvore Git de protocolo padrão único, lista exata de caminhos binários, selo de fonte determinístico e `Cargo.lock`; incluir toda declaração de artefato do seu resultado JSON no manifesto técnico final de lançamento. Isso não isenta o verificador final do pacote DOI ou qualquer gate de liberação externo.

O selo de origem é portátil e falha ao fechar: o produtor e o verificador final resolvem todo o grafo de links simbólicos arquivado, então um link que aparece na raiz mas escapa através de outro link, um ciclo, a travessia `.git`, ou um alvo no estilo Windows é rejeitado antes que os links sejam criados. Relatórios estruturados de origem e de gateway são analisados apenas a partir de arquivos estáveis limitados cujo valor de resumo criptográfico e comprimento correspondam ao manifesto técnico de lançamento, e cada tipo de carga útil de origem deve ocorrer exatamente uma vez.

Cada falha crua executada e amostra de latência deve vincular a revisão completa do código-fonte da versão, o SHA-256 de uma descrição de hardware fixada estruturada, e o SHA-256 de sua configuração exata de contagem de participantes. Arquive um único manifesto técnico de configuração padrão de protocolo cobrindo N=2,3,4,8,16; cada entrada deve referenciar os bytes de configuração retidos e afirmar exatamente quatro validadores por espaço de dados, um quórum de 3 em 4, e RS16 DA/RBC assinados obrigatoriamente. O verificador de lançamento rejeita resumos produzidos em uma compilação, perfil de hardware ou configuração de rede diferente. Cada perda individual, corte de fase e linha de falha de persistência deve, adicionalmente, nomear referências de registro exatas JSONL globalmente não reutilizáveis dentro do limite SHA-256 artefatos de controlador autenticado e captura de atomicidade. O verificador de lançamento resolve esses resumos criptográficos e exige que as linhas correspondam à identidade da execução, índice do teste e parâmetros, reconhecimento do controlador ou resultado de recuperação, contagem de verificação contínua, e zero observações de visibilidade parcial e gastabilidade. Comparações p95/p99 de lançamentos posteriores também rejeitam uma linha de base assinada cujo hardware, configurações ou requisitos de medição diferem do candidato. O verificador final regenera todos os percentis relatados, MADs, e intervalos de confiança determinísticos a partir das amostras brutas arquivadas em vez de confiar em um resumo de benchmark separado. Ele também recarrega o manifesto técnico canário e reescaneia independentemente cada superfície de privacidade arquivada, de modo que um relatório não pode suprimir uma detecção secreta plantada após a reatribuição dos resumos criptográficos dos arquivos. Cada execução apenas para segredos deve manter seu loopback pcap não filtrado exclusivo do proprietário, stderr bruto do tcpdump e estatísticas de zero perda, manifesto técnico de porta padrão de protocolo único, arquivo compactado de origem restrita e todas as observações de atomicidade de todos os pares. O verificador final reroda a divisão de pacotes ligada à porta, as projeções de origem e as verificações de atomicidade de base para terminal a partir daqueles bytes arquivados, em vez de confiar nos resumos publicados.

O arquivo também deve incluir tráfego emparelhado de contagem única com padrão de protocolo e manifestos técnicos de par diferencial vinculando os caminhos exatos dos arquivos esquerdo e direito, tipos, comprimentos em bytes e resumos criptográficos SHA-256 para cada superfície de privacidade necessária. Suas raízes declaradas devem conter exatamente o inventário de arquivos emparelhados. O verificador requer tamanhos de arquivo inteiros iguais e JSON formas públicas para superfícies comuns. A captura bruta de loopback portadora de entropia e o arquivo compactado de fonte restrita são exceções de tamanho explícitas; ela compara, em vez disso, o tipo de link do pacote e os comprimentos por pacote, as identidades de fonte restrita e os comprimentos de linha de forma fixa. Cada solicitação/resposta Torii, pacote público/restrito P2P, bloco, consulta, evento, registro e contagem de tráfego de telemetria também devem corresponder. Uma mudança na forma do pacote, vazamento estrutural de mesmo tamanho, reivindicação falsa de procedência, ou arquivo não emparelhado não pode ser ocultado reescrevendo o relatório de vazamento e seus hashes criptográficos.
