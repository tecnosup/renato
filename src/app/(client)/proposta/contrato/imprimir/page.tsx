"use client";

import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContratoImprimirPage() {
  return (
    <div className="min-h-screen bg-zinc-200 py-6 sm:py-12 px-4 print:bg-white print:p-0">
      {/* Toolbar - hidden on print */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/proposta/contrato"
          className="flex items-center gap-2 font-sans text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao contrato
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-zinc-900 text-white font-sans text-xs font-bold tracking-wide px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Document */}
      <article className="max-w-3xl mx-auto bg-white text-zinc-900 rounded-lg shadow-lg print:shadow-none print:rounded-none p-8 sm:p-14 print:p-0 font-serif text-[13px] leading-relaxed">
        <h1 className="text-xl font-bold text-center mb-1">
          Contrato de Prestação de Serviços de Desenvolvimento e Licenciamento de Uso de
          Sistema
        </h1>
        <p className="text-center text-[11px] text-zinc-500 mb-8">
          Barbearia Século XXI — Sistema de Gestão Digital
        </p>

        <Section title="1. Identificação das Partes">
          <p className="font-bold mb-1">CONTRATADOS (Desenvolvedores):</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Vitor Felipe Faria Pascoal de Oliveira, CPF nº [___.___.___-__], residente em [endereço];</li>
            <li>Abraão Lincon de Almeida Cardoso, CPF nº [___.___.___-__], residente em [endereço];</li>
          </ul>
          <p className="mb-3">
            doravante denominados, em conjunto, <strong>CONTRATADOS</strong>.
          </p>
          <p className="font-bold mb-1">CONTRATANTE:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>
              [NOME COMPLETO DO RENATO], CPF nº [___.___.___-__], proprietário da Barbearia
              Século XXI, residente/estabelecido em [endereço];
            </li>
          </ul>
          <p className="mb-3">
            doravante denominado <strong>CONTRATANTE</strong>.
          </p>
          <p>
            As partes acima identificadas têm, entre si, justo e acertado o presente
            Contrato de Prestação de Serviços de Desenvolvimento de Software e
            Licenciamento de Uso, que se regerá pelas cláusulas seguintes.
          </p>
        </Section>

        <Section title="2. Objeto do Contrato">
          <p className="mb-3">
            2.1. O presente contrato tem como objeto o desenvolvimento, customização,
            implantação e suporte de um sistema de gestão digital para barbearia
            (&quot;Sistema&quot;), composto por:
          </p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>
              (a) Landing page institucional, com apresentação de serviços, profissionais,
              planos de assinatura e agendamento online;
            </li>
            <li>
              (b) Painel administrativo para gestão da(s) unidade(s), conforme escopo
              detalhado no Anexo I (cláusula 4).
            </li>
          </ul>
          <p>
            2.2. O Sistema será desenvolvido de forma personalizada para a identidade
            visual e as necessidades operacionais do CONTRATANTE, com base na plataforma
            já em desenvolvimento pelos CONTRATADOS.
          </p>
        </Section>

        <Section title="3. Unidades Contempladas">
          <p className="mb-2">
            <span className="inline-block w-4 border border-zinc-900 mr-2 text-center">
              &nbsp;
            </span>
            <strong>Opção 1</strong> — Apenas a nova unidade da Barbearia Século XXI (a ser
            inaugurada).
          </p>
          <p className="mb-3">
            <span className="inline-block w-4 border border-zinc-900 mr-2 text-center">
              &nbsp;
            </span>
            <strong>Opção 2</strong> — Nova unidade <strong>e</strong> unidade atual
            (Século XXI já em operação), cada uma com sua própria instância do Sistema,
            incluindo migração dos dados de clientes/histórico da unidade atual a partir
            do AppBarber.
          </p>
          <p className="text-zinc-500 text-[11px] italic">
            (marcar a opção contratada e preencher o Anexo II com o valor correspondente)
          </p>
        </Section>

        <Section title="4. Escopo do Sistema (Anexo I)">
          <p className="mb-2">O Sistema, em sua versão final, contemplará:</p>
          <p className="font-bold mt-3 mb-1">Landing page / área do cliente:</p>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li>Apresentação institucional, catálogo de serviços e profissionais</li>
            <li>Planos de assinatura/clube de benefícios</li>
            <li>Agendamento online, integrado à agenda real do painel administrativo</li>
            <li>
              Pagamento online de planos e serviços (Pix/cartão), via gateway de
              pagamento
            </li>
          </ul>
          <p className="font-bold mt-3 mb-1">Painel administrativo:</p>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li>Agenda/dashboard com calendário de atendimentos</li>
            <li>Comandas (abertura, fechamento e histórico), conectadas ao banco de dados</li>
            <li>Cadastro e histórico de clientes</li>
            <li>Cadastro de produtos e serviços</li>
            <li>Cadastro de profissionais/funcionários, com login individual</li>
            <li>Financeiro: caixa diário, faturamento/despesas, comissões de profissionais</li>
            <li>Cupons de desconto</li>
            <li>Configurações: temas visuais, imagem de fundo, atalhos de navegação</li>
            <li>Importação de dados (clientes e histórico) a partir do AppBarber</li>
          </ul>
          <p className="font-bold mt-3 mb-1">Infraestrutura:</p>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li>Autenticação segura por usuário/funcionário</li>
            <li>
              Hospedagem e serviços (Vercel, Firebase, Cloudflare R2) configurados em
              contas de titularidade do CONTRATANTE (cláusula 7)
            </li>
          </ul>
          <p className="font-bold mt-3 mb-1">Bônus (cláusula 9):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Automação de mensagens via WhatsApp (confirmação de agendamento e lembrete)</li>
          </ul>
        </Section>

        <Section title="5. Investimento e Forma de Pagamento (Anexo II)">
          <p className="mb-3">
            5.1. Pelo desenvolvimento, customização e implantação do Sistema conforme o
            escopo contratado (cláusula 3), o CONTRATANTE pagará aos CONTRATADOS o valor
            total de:
          </p>
          <p className="mb-3 text-center font-bold text-base">
            R$ [_______] ([valor por extenso])
          </p>
          <p className="mb-1">5.2. Forma de pagamento:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Entrada (sinal) de R$ [_______], paga na assinatura deste contrato;</li>
            <li>Saldo de R$ [_______], pago na entrega/ativação do Sistema em produção.</li>
          </ul>
          <p>
            5.3. O valor acima refere-se exclusivamente ao desenvolvimento e implantação.
            Custos de infraestrutura (cláusula 7) e eventual mensalidade de suporte
            pós-garantia (cláusula 8) são tratados em cláusulas próprias.
          </p>
        </Section>

        <Section title="6. Prazo de Entrega">
          <p className="mb-3">
            6.1. Os CONTRATADOS se comprometem a entregar o Sistema completo, conforme o
            escopo do Anexo I, em até <strong>25 (vinte e cinco) dias corridos</strong> a
            partir da data de assinatura deste contrato, com previsão de conclusão até{" "}
            <strong>10/07/2026</strong>, de modo a antecipar a inauguração da nova unidade,
            prevista para <strong>15/07/2026</strong>.
          </p>
          <p className="mb-3">
            6.2. Caso a entrega dependa de informações, materiais (fotos, textos, dados
            para importação) ou aprovações do CONTRATANTE, o prazo acima será prorrogado
            proporcionalmente ao tempo de atraso na entrega dessas informações pelo
            CONTRATANTE.
          </p>
          <p className="mb-3">
            6.3. Considera-se &quot;entregue&quot; o Sistema disponível em produção
            (acessível via internet) e funcional conforme o escopo do Anexo I.
          </p>
          <p>
            6.4. Após a entrega, o CONTRATANTE terá <strong>3 (três) dias úteis</strong>{" "}
            para aprovar o Sistema ou solicitar ajustes dentro do escopo do Anexo I.
            Decorrido esse prazo sem manifestação, o Sistema será considerado aprovado,
            tornando-se devido o saldo previsto na cláusula 5.2.
          </p>
        </Section>

        <Section title="7. Infraestrutura e Contas de Serviço">
          <p className="mb-3">
            7.1. Todas as contas de serviços necessárias para o funcionamento do Sistema —
            incluindo, mas não se limitando a, Vercel (hospedagem), Firebase (banco de
            dados, autenticação e armazenamento) e Cloudflare R2 (armazenamento de
            arquivos) — serão criadas em nome e sob titularidade do CONTRATANTE.
          </p>
          <p className="mb-3">
            7.2. Os CONTRATADOS atuarão como colaboradores/administradores técnicos dessas
            contas durante o desenvolvimento e o período de suporte, sem deter a
            titularidade sobre elas.
          </p>
          <p>
            7.3. Os custos de uso dessas plataformas (caso ultrapassem os limites dos
            planos gratuitos) são de responsabilidade exclusiva do CONTRATANTE,
            independentemente do suporte contratado na cláusula 8.
          </p>
        </Section>

        <Section title="8. Suporte e Manutenção">
          <p className="mb-3">
            8.1. Após a entrega do Sistema, os CONTRATADOS prestarão suporte gratuito
            (correções de erros, ajustes pontuais e atualizações de segurança) por{" "}
            <strong>12 (doze) meses</strong>, contados da data de entrega.
          </p>
          <p className="mb-1">8.2. Encerrado esse período, o CONTRATANTE poderá optar por:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>
              (a) <strong>Continuar recebendo suporte</strong> dos CONTRATADOS, mediante
              mensalidade de <strong>R$ 129,90</strong> (cobrindo ambas as unidades, caso
              contratadas); ou
            </li>
            <li>
              (b) <strong>Não renovar o suporte</strong>, hipótese em que o Sistema
              permanecerá em pleno funcionamento e de propriedade do CONTRATANTE (cláusula
              10), porém sem atualizações, correções ou suporte técnico por parte dos
              CONTRATADOS.
            </li>
          </ul>
          <p className="mb-3">
            8.3. A mensalidade de suporte, caso optada, não possui prazo de fidelidade
            obrigatório e pode ser cancelada pelo CONTRATANTE a qualquer momento,
            retornando à situação da alínea (b) acima.
          </p>
          <p className="mb-3">
            8.4. O suporte previsto nesta cláusula não inclui o desenvolvimento de novas
            funcionalidades não previstas no Anexo I, que serão objeto de orçamento e
            acordo específicos.
          </p>
          <p>
            8.5. Em caso de inadimplência da mensalidade prevista na alínea (a) da
            cláusula 8.2 por mais de 30 (trinta) dias, o suporte técnico será suspenso
            até a regularização. O Sistema permanecerá funcional normalmente, pois a
            infraestrutura está em contas de titularidade do CONTRATANTE (cláusula 7).
          </p>
        </Section>

        <Section title="9. Bônus: Automação de Mensagens via WhatsApp">
          <p className="mb-3">
            9.1. Como bônus incluso neste contrato, os CONTRATADOS implementarão um sistema
            de mensagens automáticas via WhatsApp para:
          </p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Confirmação automática ao cliente no momento do agendamento;</li>
            <li>Lembrete automático enviado 1 (uma) hora antes do horário agendado.</li>
          </ul>
          <p className="mb-3">
            9.2. Essa automação utilizará um número de WhatsApp de titularidade do
            CONTRATANTE.
          </p>
          <p>
            9.3. Em razão da natureza dessa tecnologia, os CONTRATADOS não garantem
            disponibilidade contínua ou ininterrupta dessa automação, podendo o serviço
            sofrer instabilidades decorrentes de políticas de terceiros (WhatsApp/Meta),
            sem que isso constitua descumprimento contratual ou gere direito a
            indenização.
          </p>
        </Section>

        <Section title="10. Propriedade Intelectual e Reutilização da Base Tecnológica">
          <p className="mb-3">
            10.1. Após o pagamento integral previsto na cláusula 5, o CONTRATANTE passa a
            ser proprietário da instância do Sistema implantada para o seu negócio,
            incluindo seus dados, customizações visuais (identidade da marca) e conteúdo.
          </p>
          <p>
            10.2. Os CONTRATADOS permanecem livres para utilizar, reaproveitar e adaptar a
            base tecnológica, arquitetura e código-fonte genérico do Sistema para o
            desenvolvimento de soluções a outros clientes, desde que não reutilizem a
            identidade visual, dados ou conteúdo específicos do CONTRATANTE.
          </p>
        </Section>

        <Section title="11. O que não está incluso">
          <p className="mb-2">
            Não estão incluídos no valor da cláusula 5, salvo acordo expresso em
            contrário:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Custos de domínio próprio (caso o CONTRATANTE deseje um domínio personalizado);</li>
            <li>Custos de mensagens além dos limites gratuitos das plataformas utilizadas;</li>
            <li>Produção de conteúdo (fotos profissionais, textos, vídeos);</li>
            <li>
              Taxas de gateway de pagamento (Pix, cartão) cobradas por transação,
              repassadas pelo provedor;
            </li>
            <li>
              Funcionalidades não listadas no Anexo I (cláusula 4), que poderão ser
              orçadas separadamente como evolução do Sistema.
            </li>
          </ul>
        </Section>

        <Section title="12. Alterações de Escopo">
          <p>
            12.1. Qualquer solicitação de funcionalidade não prevista no Anexo I, feita
            antes ou depois da entrega, será tratada como evolução do Sistema, com prazo e
            valor a serem acordados entre as partes em aditivo a este contrato ou em novo
            orçamento.
          </p>
        </Section>

        <Section title="13. Garantia e Correções">
          <p>
            13.1. Durante o período de suporte gratuito (cláusula 8.1), os CONTRATADOS
            corrigirão, sem custo adicional, eventuais erros (bugs) identificados em
            funcionalidades previstas no Anexo I.
          </p>
        </Section>

        <Section title="14. Rescisão">
          <p className="mb-3">
            14.1. Este contrato poderá ser rescindido por qualquer das partes em caso de
            descumprimento de suas obrigações, mediante notificação prévia de 15 (quinze)
            dias para sanar a irregularidade.
          </p>
          <p>
            14.2. Em caso de rescisão antes da entrega do Sistema, valores já pagos a
            título de entrada (cláusula 5.2) serão tratados proporcionalmente ao trabalho
            já realizado, a ser definido de comum acordo entre as partes.
          </p>
        </Section>

        <Section title="15. Disposições Gerais">
          <p className="mb-3">
            15.1. Este contrato representa o entendimento integral entre as partes,
            substituindo acordos verbais anteriores sobre o mesmo objeto.
          </p>
          <p>
            15.2. Fica eleito o foro da comarca de [CIDADE/UF] para dirimir quaisquer
            dúvidas decorrentes deste contrato.
          </p>
        </Section>

        <p className="mt-8 mb-10">
          E por estarem de acordo, as partes assinam o presente instrumento em 2 (duas)
          vias de igual teor.
        </p>

        <p className="mb-10">[CIDADE], [DATA]</p>

        <div className="space-y-10">
          <SignatureLine label="Vitor Felipe Faria Pascoal de Oliveira — CONTRATADO" />
          <SignatureLine label="Abraão Lincon de Almeida Cardoso — CONTRATADO" />
          <SignatureLine label="[NOME DO RENATO] — CONTRATANTE" />
        </div>
      </article>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          html,
          body {
            background: #fff !important;
          }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 break-inside-avoid">
      <h2 className="font-bold text-[14px] mb-2">{title}</h2>
      {children}
    </section>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div className="text-center">
      <div className="border-t border-zinc-900 w-72 mx-auto mb-1" />
      <p className="text-[12px]">{label}</p>
    </div>
  );
}
