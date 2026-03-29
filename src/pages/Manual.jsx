import React, { useState } from 'react';
import { BookOpen, Monitor, FileText, Database, Activity, Users, ChevronRight, Server, ShieldCheck, ShieldAlert, ShieldOff, RefreshCcw, Trash2, Upload, Plus, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const manualSections = [
    {
        id: 'intro',
        title: 'Introdução',
        icon: BookOpen,
        content: (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Manual do Usuário</h2>
                <p className="text-text-secondary">
                    Bem-vindo ao manual de utilização do sistema <strong>Agenda Hub Basic</strong>.
                    Este guia foi criado para orientar você em todas as operações disponíveis na plataforma, com passo a passo claro e detalhado.
                </p>
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded text-blue-400">
                    <strong>Nota:</strong> Utilize o menu lateral para navegar entre os tópicos deste manual.
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Módulos do Sistema</h3>
                <ul className="list-disc list-inside space-y-1 text-text-secondary ml-4">
                    <li><strong>Importações / Jobs</strong> — Cria e monitora solicitações de processamento automático.</li>
                    <li><strong>Base Guias</strong> — Consulta e exporta o histórico de guias importadas.</li>
                    <li><strong>Gestão PEI</strong> — Controle de validade dos Planos de Ensino Individualizados.</li>
                    <li><strong>Carteirinhas</strong> — Gerenciamento da base de pacientes/carteirinhas.</li>
                    <li><strong>Logs</strong> — Monitoramento técnico dos robôs de automação.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'access',
        title: 'Acesso ao Sistema',
        icon: Users,
        content: (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Acesso ao Sistema</h2>
                <p className="text-text-secondary">Para acessar o sistema, você deve possuir uma chave de acesso cadastrada pelo administrador.</p>
                <ol className="list-decimal list-inside space-y-2 text-text-secondary ml-4">
                    <li>Acesse a URL do sistema no seu navegador.</li>
                    <li>Na tela de login, insira sua <strong>Chave de Acesso</strong> (fornecida pelo administrador).</li>
                    <li>Clique no botão <strong>Acessar Sistema</strong>.</li>
                </ol>
                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded text-amber-500">
                    Se a sua sessão expirar por inatividade, você será redirecionado automaticamente para a tela de login.
                </div>
            </div>
        )
    },
    {
        id: 'jobs',
        title: 'Importações / Jobs',
        icon: FileText,
        content: (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary">Módulo: Importações / Jobs</h2>
                <p className="text-text-secondary">
                    Este é o módulo central de automação. Aqui você cria solicitações (jobs) que serão processadas
                    pelos <strong>Workers</strong> (robôs) registrados no sistema.
                </p>

                {/* Stats Bar */}
                <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Barra de Estatísticas</h3>
                    <p className="text-text-secondary mb-2">No topo da tela, são exibidos 5 cards com os totais em tempo real:</p>
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="info">Carteirinhas</Badge>
                        <Badge variant="success">Guias</Badge>
                        <Badge variant="warning">Jobs Total</Badge>
                        <Badge variant="success">Sucesso</Badge>
                        <Badge variant="error">Erros</Badge>
                    </div>
                </div>

                {/* Workers */}
                <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2 flex items-center gap-2">
                        <Server size={18} /> Workers Linkados
                    </h3>
                    <p className="text-text-secondary">
                        No canto superior direito, é exibida a lista de <strong>Workers</strong> (computadores/robôs) conectados ao sistema.
                        Cada worker exibe seu status (online/offline) e nome. Os jobs são distribuídos automaticamente entre os workers disponíveis.
                    </p>
                </div>

                {/* Nova Solicitação */}
                <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Criar Nova Solicitação</h3>
                    <p className="text-text-secondary mb-2">No painel "Nova Solicitação", selecione o tipo:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-text-secondary">
                        <li><strong>Única</strong>: Processa um único paciente. Selecione o paciente no campo de busca.</li>
                        <li><strong>Múltipla</strong>: Selecione vários pacientes usando a busca. Pressione <kbd className="bg-slate-700 px-1 rounded text-xs">Enter</kbd> ou clique em <strong>+</strong> para adicionar cada um.</li>
                        <li><strong>Todos</strong>: Processa toda a base de carteirinhas. Uma confirmação é exigida.</li>
                        <li><strong>Paciente Temporário</strong>: Para consultar um paciente que ainda não está na base. Informe o número da carteirinha (formato <code className="bg-slate-800 px-1 rounded text-xs">0000.0000.000000.00-0</code>) e o nome.</li>
                    </ul>
                    <p className="text-text-secondary mt-2">Após configurar, clique no botão <strong>Criar</strong> para enviar a solicitação.</p>
                </div>

                {/* Lista de Jobs */}
                <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Lista de Jobs</h3>
                    <p className="text-text-secondary mb-2">A tabela inferior exibe todos os jobs. É possível filtrar por:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-text-secondary">
                        <li><strong>Status</strong>: Todos, Sucesso, Erro, Pendente ou Processando.</li>
                        <li><strong>Período</strong>: Data de criação (Início / Fim).</li>
                    </ul>
                    <p className="text-text-secondary mt-2">A lista é atualizada automaticamente a cada 5 segundos. Colunas disponíveis:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-text-secondary mt-2">
                        <li><strong>ID / Data Criação / Status / Tentativas / Tempo Proc.</strong> — Clique nos cabeçalhos para ordenar.</li>
                        <li><strong>Status Guias</strong> — Ícone interativo que indica o resultado das guias processadas:
                            <div className="flex flex-col gap-1 mt-2 ml-4">
                                <span className="flex items-center gap-2 text-emerald-400"><ShieldCheck size={16} /> <strong>Válidas</strong> — Todas as guias foram processadas com sucesso. Clique para ver detalhes.</span>
                                <span className="flex items-center gap-2 text-amber-400"><ShieldAlert size={16} /> <strong>Bloqueadas</strong> — Existem guias com vínculo de prestador bloqueado. Passe o mouse para ver o resumo de bloqueios ou clique para ver detalhes.</span>
                                <span className="flex items-center gap-2 text-red-400"><ShieldOff size={16} /> <strong>Sem Guias</strong> — Nenhuma guia foi processada neste job.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Status */}
                <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Status dos Jobs</h3>
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="warning">Pendente</Badge>
                        <Badge variant="info">Processando</Badge>
                        <Badge variant="success">Sucesso</Badge>
                        <Badge variant="error">Erro</Badge>
                    </div>
                </div>

                {/* Ações */}
                <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">Ações em Jobs com Erro</h3>
                    <p className="text-text-secondary mb-2">Jobs com status <Badge variant="error">Erro</Badge> exibem dois botões de ação:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-text-secondary">
                        <li className="flex items-center gap-2"><RefreshCcw size={14} className="text-amber-500" /> <strong>Reprocessar</strong> — Reenvia o job para a fila de processamento.</li>
                        <li className="flex items-center gap-2"><Trash2 size={14} className="text-red-500" /> <strong>Excluir</strong> — Remove o job permanentemente.</li>
                    </ul>
                </div>

                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded text-blue-400">
                    <strong>Dica:</strong> O modal de detalhes das guias (aberto ao clicar no ícone de Status Guias) exibe o número da guia, código de terapia e status do vínculo com o prestador para cada guia processada.
                </div>
            </div>
        )
    },
    {
        id: 'guides',
        title: 'Base Guias',
        icon: Database,
        content: (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Módulo: Base Guias</h2>
                <p className="text-text-secondary">Consulta completa do histórico de guias importadas pelo sistema. Os dados são paginados e atualizados conforme novos jobs são concluídos.</p>

                <h3 className="text-lg font-semibold text-text-primary">Filtros Disponíveis</h3>
                <ul className="list-disc list-inside space-y-2 text-text-secondary ml-4">
                    <li><strong>Paciente / Carteirinha</strong>: Selecione via campo de busca inteligente (SearchableSelect). Permite digitar para filtrar ou colar o número da carteirinha diretamente.</li>
                    <li><strong>Data Importação Início</strong>: Filtra guias importadas a partir de uma data.</li>
                    <li><strong>Data Importação Fim</strong>: Filtra guias importadas até uma data.</li>
                    <li>Clique em <strong>Limpar</strong> para remover todos os filtros.</li>
                </ul>

                <h3 className="text-lg font-semibold text-text-primary">Colunas da Tabela</h3>
                <ul className="list-disc list-inside space-y-1 text-text-secondary ml-4">
                    <li><strong>Data Import.</strong> — Data/hora da importação (clicável para ordenar).</li>
                    <li><strong>Carteira / Paciente</strong> — Nome do paciente vinculado à carteirinha.</li>
                    <li><strong>Guia</strong> — Número da guia (clicável para ordenar).</li>
                    <li><strong>Data Autoriz.</strong> — Data de autorização da guia (clicável para ordenar).</li>
                    <li><strong>Status</strong> — Indica a validação do prestador para aquela guia:
                        <div className="flex flex-col gap-1 mt-2 ml-4">
                            <span className="flex items-center gap-2 text-emerald-400"><ShieldCheck size={16} /> <strong>Válida</strong> — Guia pertencente à rede.</span>
                            <span className="flex items-center gap-2 text-amber-400"><ShieldAlert size={16} /> <strong>Bloqueada</strong> — Prestador não pertence à rede (passe o mouse para ver o erro).</span>
                            <span className="flex items-center gap-2 text-red-400"><ShieldOff size={16} /> <strong>Sem Info</strong> — Validação não disponível.</span>
                        </div>
                    </li>
                    <li><strong>Senha</strong> — Senha da guia.</li>
                    <li><strong>Validade</strong> — Data de validade (clicável para ordenar).</li>
                    <li><strong>Código Procedimento</strong> — Identificação da terapia/procedimento.</li>
                    <li><strong>Solicitado / Autorizado</strong> — Qtde. de sessões solicitadas e autorizadas.</li>
                </ul>

                <h3 className="text-lg font-semibold text-text-primary">Exportação</h3>
                <p className="text-text-secondary">
                    Clique no botão <span className="text-emerald-400 font-bold flex items-center gap-1 inline-flex"><Download size={14} /> Exportar</span> para baixar
                    um relatório Excel (.xlsx) com as guias filtradas atualmente. Um overlay de carregamento é exibido durante a geração do arquivo.
                </p>

                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded text-amber-500">
                    <strong>Dica:</strong> Combine os filtros de Paciente e Período para exportar relatórios específicos por paciente e intervalo de datas.
                </div>
            </div>
        )
    },
    {
        id: 'pei',
        title: 'Gestão PEI',
        icon: Activity,
        content: (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Módulo: Gestão PEI</h2>
                <p className="text-text-secondary">Controle e validação dos Planos de Ensino Individualizado (PEI) dos pacientes.</p>

                <h3 className="text-lg font-semibold text-text-primary">Operações</h3>
                <ol className="list-decimal list-inside space-y-2 text-text-secondary ml-4">
                    <li>
                        <strong>Validar/Editar PEI</strong>:
                        Guias com status <Badge variant="warning">Pendente</Badge> possuem um botão de edição (ícone de lápis).
                        Clique no lápis, digite o novo valor de validade e salve. O status mudará para <Badge variant="success">Validado</Badge>.
                    </li>
                    <li>
                        <strong>Exportação</strong>: Gere planilhas Excel com os dados de validade e status dos PEIs.
                    </li>
                </ol>
            </div>
        )
    },
    {
        id: 'users',
        title: 'Carteirinhas',
        icon: Users,
        content: (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary">Módulo: Carteirinhas</h2>
                <p className="text-text-secondary">Gerenciamento completo da base de dados de pacientes/carteirinhas do sistema.</p>

                <h3 className="text-lg font-semibold text-text-primary">Filtros de Busca</h3>
                <p className="text-text-secondary">Quatro filtros disponíveis na barra de busca:</p>
                <ul className="list-disc list-inside space-y-1 text-text-secondary ml-4">
                    <li><strong>Busca Geral</strong>: Pesquisa em todos os campos.</li>
                    <li><strong>Filtrar Paciente</strong>: Filtra pelo nome do paciente.</li>
                    <li><strong>Convênio</strong>: Filtra pelo ID do convênio/pagamento.</li>
                    <li><strong>Status</strong>: Filtra entre Todos, Ativo ou Inativo.</li>
                    <li>Clique em <strong>Limpar</strong> para redefinir todos os filtros.</li>
                </ul>

                <h3 className="text-lg font-semibold text-text-primary">Cadastro Manual</h3>
                <p className="text-text-secondary">Para adicionar um único paciente:</p>
                <ol className="list-decimal list-inside space-y-1 text-text-secondary ml-4">
                    <li>Clique no botão <strong className="flex items-center gap-1 inline-flex"><Plus size={14} /> Nova Carteirinha</strong>.</li>
                    <li>Preencha os campos obrigatórios:
                        <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                            <li><strong>Carteirinha *</strong>: Formato <code className="bg-slate-800 px-1 rounded text-xs">0000.0000.000000.00-0</code> (máscara automática).</li>
                            <li><strong>Paciente</strong>: Nome completo do paciente.</li>
                            <li><strong>ID Paciente *</strong>: Número de identificação do paciente no sistema da clínica.</li>
                            <li><strong>Convênio *</strong>: Selecione entre Unimed Goiânia Guia, Unimed Intercâmbio, Ipasgo - TEA ou Ipasgo - Geral.</li>
                            <li><strong>Status</strong>: Ativo ou Inativo.</li>
                        </ul>
                    </li>
                    <li>Clique em <strong>Salvar</strong>.</li>
                </ol>

                <h3 className="text-lg font-semibold text-text-primary">Edição</h3>
                <p className="text-text-secondary">Na tabela de listagem, clique no ícone <strong>Lápis</strong> (editar) para abrir o modal de edição e alterar os dados cadastrais do paciente.</p>

                <h3 className="text-lg font-semibold text-text-primary">Exclusão</h3>
                <p className="text-text-secondary">Clique no ícone <strong>Lixeira</strong> para remover um paciente. Uma confirmação é exigida antes de excluir.</p>

                <h3 className="text-lg font-semibold text-text-primary">Importação em Lote (Upload)</h3>
                <ol className="list-decimal list-inside space-y-1 text-text-secondary ml-4">
                    <li>Clique no botão <strong className="flex items-center gap-1 inline-flex"><Upload size={14} /> Upload Carteirinhas (Excel/CSV)</strong>.</li>
                    <li>Selecione o arquivo (.xlsx, .xls ou .csv).</li>
                    <li>Marque <strong>"Sobrescrever tudo?"</strong> se desejar substituir todos os registros existentes (use com cautela).</li>
                    <li>Clique em <strong>Importar</strong>.</li>
                </ol>

                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded text-amber-500">
                    <strong>Atenção:</strong> A opção "Sobrescrever tudo" apagará todos os registros existentes antes de importar. Use apenas quando necessário atualizar toda a base.
                </div>

                <h3 className="text-lg font-semibold text-text-primary">Convênios Suportados</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-text-secondary border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-xs uppercase">
                                <th className="px-4 py-2 text-left border border-border">ID Pagamento</th>
                                <th className="px-4 py-2 text-left border border-border">Convênio</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td className="px-4 py-2 border border-border font-mono">3</td><td className="px-4 py-2 border border-border">Unimed Goiânia Guia</td></tr>
                            <tr><td className="px-4 py-2 border border-border font-mono">21</td><td className="px-4 py-2 border border-border">Unimed Intercâmbio</td></tr>
                            <tr><td className="px-4 py-2 border border-border font-mono">6</td><td className="px-4 py-2 border border-border">Ipasgo - TEA</td></tr>
                            <tr><td className="px-4 py-2 border border-border font-mono">31</td><td className="px-4 py-2 border border-border">Ipasgo - Geral</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    },
    {
        id: 'logs',
        title: 'Logs',
        icon: Activity,
        content: (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Módulo: Logs</h2>
                <p className="text-text-secondary">Área técnica para verificação de saúde do sistema. Exibe mensagens de erro, avisos e informações de processamento dos robôs (workers).</p>
                <ul className="list-disc list-inside space-y-2 text-text-secondary ml-4">
                    <li>Use o botão <strong>Atualizar</strong> para carregar os eventos mais recentes.</li>
                    <li>Os logs mostram a atividade dos workers, incluindo início/fim de jobs e mensagens de erro detalhadas.</li>
                    <li>Em caso de falha repetida em um job, consulte os logs para identificar a causa raiz antes de reprocessar.</li>
                </ul>
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded text-blue-400">
                    <strong>Dica:</strong> Esta tela é voltada para uso técnico/administrativo. Em caso de dúvidas sobre mensagens de log, entre em contato com o suporte.
                </div>
            </div>
        )
    }
];

export default function Manual() {
    const [activeSection, setActiveSection] = useState('intro');

    const activeContent = manualSections.find(s => s.id === activeSection);

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">

            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 flex-shrink-0">
                <Card className="h-full overflow-y-auto">
                    <h3 className="text-lg font-bold text-text-primary mb-4 px-2">Conteúdo</h3>
                    <nav className="space-y-1">
                        {manualSections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeSection === section.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-secondary hover:bg-slate-800 hover:text-text-primary'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon size={18} />
                                    <span>{section.title}</span>
                                </div>
                                {activeSection === section.id && <ChevronRight size={16} />}
                            </button>
                        ))}
                    </nav>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 h-full overflow-y-auto">
                <Card className="h-full">
                    <div className="prose prose-invert max-w-none">
                        {activeContent?.content}
                    </div>
                </Card>
            </div>
        </div>
    );
}
