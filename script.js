document.addEventListener('DOMContentLoaded', () => {
    const formTreino = document.getElementById('form-treino');
    const configuracaoTreinoSection = document.getElementById('configuracao-treino');
    const execucaoTreinoSection = document.getElementById('execucao-treino');

    const currentStageNameSpan = document.getElementById('current-stage-name');
    const timeRemainingSpan = document.getElementById('time-remaining');
    const currentSpeedSpan = document.getElementById('current-speed');
    const mioloInfoDiv = document.getElementById('miolo-info');
    const currentRepetitionSpan = document.getElementById('current-repetition');
    const totalRepetitionsSpan = document.getElementById('total-repetitions');

    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    let treino = null;
    let currentStageIndex = 0;
    let timeInSeconds = 0;
    let timerInterval = null;
    let isPaused = true;
    let mioloCurrentRepetition = 0;
    const notificationSound = new Audio('som.mp3');
    const startSound = new Audio('start.mp3');



    // Estrutura para o treino
    class Treino {
        constructor(aquecimento, miolo, desaquecimento) {
            this.aquecimento = aquecimento; // { velocidade, minutos }
            this.miolo = miolo; // { vel1, min1, vel2, min2, repeticoes }
            this.desaquecimento = desaquecimento; // { velocidade, minutos }
            this.stages = this.buildStages();
        }

        buildStages() {
            const stages = [];

            // Aquecimento
            stages.push({
                name: 'Aquecimento',
                duration: this.aquecimento.minutos * 60,
                speed: this.aquecimento.velocidade
            });

            // Miolo
            for (let i = 0; i < this.miolo.repeticoes; i++) {
                // Variação 1 do Miolo
                stages.push({
                    name: `Miolo (Rep. ${i + 1}/${this.miolo.repeticoes}) - Corrida Rápida`,
                    duration: this.miolo.min1 * 60,
                    speed: this.miolo.vel1,
                    isMiolo: true,
                    repetition: i + 1
                });
                // Variação 2 do Miolo
                stages.push({
                    name: `Miolo (Rep. ${i + 1}/${this.miolo.repeticoes}) - Recuperação`,
                    duration: this.miolo.min2 * 60,
                    speed: this.miolo.vel2,
                    isMiolo: true,
                    repetition: i + 1
                });
            }

            // Desaquecimento
            stages.push({
                name: 'Desaquecimento',
                duration: this.desaquecimento.minutos * 60,
                speed: this.desaquecimento.velocidade
            });

            return stages;
        }
    }

    function playNotificationSound() {
        notificationSound.currentTime = 0; // Reinicia o som caso seja chamado rapidamente
        notificationSound.play().catch(e => console.error("Erro ao tocar o som:", e));
    }

    function playStartSound() {
        startSound.currentTime = 0; // Reinicia o som caso seja chamado rapidamente
        startSound.play().catch(e => console.error("Erro ao tocar o som:", e));
    }

    // Função para formatar o tempo
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    // Função para atualizar o display
    function updateDisplay() {
        const currentStage = treino.stages[currentStageIndex];
        currentStageNameSpan.textContent = currentStage.name;
        timeRemainingSpan.textContent = formatTime(timeInSeconds);
        currentSpeedSpan.textContent = currentStage.speed;

        if (currentStage.isMiolo) {
            mioloInfoDiv.style.display = 'block';
            currentRepetitionSpan.textContent = currentStage.repetition;
            totalRepetitionsSpan.textContent = treino.miolo.repeticoes;
        } else {
            mioloInfoDiv.style.display = 'none';
        }
    }

    // Função para avançar para a próxima etapa
    function nextStage() {
        currentStageIndex++;
        if (currentStageIndex < treino.stages.length) {
            timeInSeconds = treino.stages[currentStageIndex].duration;
            updateDisplay();
        } else {
            // Treino concluído
            clearInterval(timerInterval);
            timerInterval = null;
            timeRemainingSpan.textContent = "00:00";
            currentStageNameSpan.textContent = "Treino Concluído!";
            currentSpeedSpan.textContent = "0";
            mioloInfoDiv.style.display = 'none';
            startPauseBtn.textContent = "Iniciar";
            startPauseBtn.disabled = true; // Desabilita o botão Iniciar
            alert("Parabéns! Seu treino foi concluído!");
        }
    }

    // Função para iniciar ou pausar o timer
    function toggleTimer() {
        if (isPaused) {
            isPaused = false;
            startPauseBtn.textContent = "Pausar";
            startPauseBtn.classList.add('pause');
            timerInterval = setInterval(() => {
                if (timeInSeconds > 0) {
                    timeInSeconds--;
                    updateDisplay();
                    if (timeInSeconds <= 3 && timeInSeconds > 0) {
                        playNotificationSound();
                    }
                } else {
                    playStartSound();
                    nextStage();
                }
            }, 1000);
        } else {
            isPaused = true;
            startPauseBtn.textContent = "Continuar";
            startPauseBtn.classList.remove('pause');
            clearInterval(timerInterval);
        }
    }

    // Função para resetar o treino
    function resetTreino() {
        clearInterval(timerInterval);
        timerInterval = null;
        isPaused = true;
        currentStageIndex = 0;
        treino = null; // Limpa o treino atual
        timeInSeconds = 0;
        mioloCurrentRepetition = 0;

        startPauseBtn.textContent = "Iniciar";
        startPauseBtn.classList.remove('pause');
        startPauseBtn.disabled = false; // Reabilita o botão Iniciar
        execucaoTreinoSection.style.display = 'none';
        configuracaoTreinoSection.style.display = 'block';
    }

    // Event Listener para o formulário de treino
    formTreino.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Coleta os dados do formulário
        const aquecimentoVel = parseFloat(document.getElementById('aquecimento-velocidade').value);
        const aquecimentoMin = parseInt(document.getElementById('aquecimento-minutos').value);
        const mioloVel1 = parseFloat(document.getElementById('miolo-vel1-1').value);
        const mioloMin1 = parseInt(document.getElementById('miolo-min1-1').value);
        const mioloVel2 = parseFloat(document.getElementById('miolo-vel2-1').value);
        const mioloMin2 = parseInt(document.getElementById('miolo-min2-1').value);
        const mioloRepeticoes = parseInt(document.getElementById('miolo-repeticoes').value);
        const desaquecimentoVel = parseFloat(document.getElementById('desaquecimento-velocidade').value);
        const desaquecimentoMin = parseInt(document.getElementById('desaquecimento-minutos').value);

        // Cria o objeto de treino
        treino = new Treino(
            { velocidade: aquecimentoVel, minutos: aquecimentoMin },
            { vel1: mioloVel1, min1: mioloMin1, vel2: mioloVel2, min2: mioloMin2, repeticoes: mioloRepeticoes },
            { velocidade: desaquecimentoVel, minutos: desaquecimentoMin }
        );

        // Oculta a seção de configuração e exibe a de execução
        configuracaoTreinoSection.style.display = 'none';
        execucaoTreinoSection.style.display = 'block';

        // Inicializa o primeiro estágio
        currentStageIndex = 0;
        timeInSeconds = treino.stages[currentStageIndex].duration;
        updateDisplay();
        startPauseBtn.textContent = "Iniciar"; // Garante que o texto seja "Iniciar"
        isPaused = true; // Garante que o treino comece pausado
    });

    // Event Listeners para os botões de controle
    startPauseBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTreino);
});