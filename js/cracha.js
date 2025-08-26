document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const nomeInput = document.getElementById('nome');
    const fotoInput = document.getElementById('foto');
    const nomeCracha = document.getElementById('nome-cracha');
    const fotoPreview = document.getElementById('foto-preview');
    const formCracha = document.getElementById('form-cracha');
    const crachaContainer = document.getElementById('cracha-container');
    const crachaFrente = document.getElementById('cracha-frente');
    const crachaVerso = document.getElementById('cracha-verso');
    const baixarFrenteBtn = document.getElementById('baixar-frente');
    const baixarVersoBtn = document.getElementById('baixar-verso');
    const feedbackAudio = document.getElementById('feedback-audio');
    const successModal = document.getElementById('success-modal');
    const modalCard = document.getElementById('modal-card');
    const closeModalBtn = document.getElementById('close-modal');
    const crachaHelp = document.getElementById('cracha-help');
    const socialQrInput = document.getElementById('social-qr-input');
    const socialQr = document.getElementById('social-qr');
    const socialQrContainer = document.getElementById('social-qr-container');

    let isFrente = true; // Estado de rotação

    // ================================================================
    // Função para carregar dados do localStorage
    // ================================================================
    function carregarDados() {
        const nomeSalvo = localStorage.getItem('nomeUsuario');
        const fotoSalva = localStorage.getItem('fotoUsuario');
        const socialQrSalvo = localStorage.getItem('socialQr');

        if (nomeSalvo) {
            nomeInput.value = nomeSalvo;
            nomeCracha.textContent = nomeSalvo;
        }

        if (fotoSalva) {
            fotoPreview.innerHTML = `<img src="${fotoSalva}" alt="Foto do usuário" class="w-full h-full object-cover">`;
        } else {
            fotoPreview.innerHTML = `<i data-lucide="user" class="w-12 h-12 text-gray-500"></i>`;
            lucide.createIcons();
        }

        if (socialQrSalvo) {
            socialQr.src = socialQrSalvo;
            socialQr.className = "w-24 h-24 object-contain"; // QR maior
            socialQrContainer.className = "mt-4 w-24 h-24 flex items-center justify-center"; 
        } else {
            socialQr.src = "assets/imgs/logo.png";
            socialQr.className = "w-16 h-16 object-contain";
            socialQrContainer.className = "mt-4 w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 p-3 shadow-lg";
        }
    }

    // ================================================================
    // Função para salvar dados
    // ================================================================
    function salvarDados(nome, foto, qr) {
        localStorage.setItem('nomeUsuario', nome);
        if (foto) {
            localStorage.setItem('fotoUsuario', foto);
        }
        if (qr !== undefined) {
            if (qr) {
                localStorage.setItem('socialQr', qr);
            } else {
                localStorage.removeItem('socialQr');
            }
        }
    }

    // ================================================================
    // SUBMISSÃO DO FORMULÁRIO
    // ================================================================
    formCracha.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = nomeInput.value.trim();
        const arquivoFoto = fotoInput.files[0];

        if (arquivoFoto) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fotoDataUrl = event.target.result;
                salvarDados(nome, fotoDataUrl);
                carregarDados();
                exibirFeedback();
            };
            reader.readAsDataURL(arquivoFoto);
        } else {
            salvarDados(nome);
            carregarDados();
            exibirFeedback();
        }
    });

    // ================================================================
    // EVENTOS
    // ================================================================
    nomeInput.addEventListener('input', (e) => {
        nomeCracha.textContent = e.target.value.trim() || 'Seu Nome';
    });

    fotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                fotoPreview.innerHTML = `<img src="${ev.target.result}" alt="Foto do usuário" class="w-full h-full object-cover">`;
            };
            reader.readAsDataURL(file);
        } else {
            fotoPreview.innerHTML = `<i data-lucide="user" class="w-12 h-12 text-gray-500"></i>`;
            lucide.createIcons();
        }
    });

    crachaContainer.addEventListener('click', () => {
        crachaContainer.classList.toggle('virado');
        isFrente = !isFrente;
        crachaHelp.classList.add('hidden');
    });

    function exibirFeedback() {
    if (feedbackAudio) feedbackAudio.play();

    // 1. Dispara os confetes!
    confetti({
        particleCount: 100, 
        spread: 70,         
        origin: { y: 0.6 }  
    });

    // 2. Torna o fundo do modal visível
    successModal.classList.remove('opacity-0', 'invisible');

    // 3. Anima o card para o estado visível
    setTimeout(() => {
        modalCard.classList.remove('scale-95', 'opacity-0');
    }, 50);
}

    function fecharModal() {

        modalCard.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            successModal.classList.add('opacity-0', 'invisible');
        }, 300);
    }

    // Evento para fechar o modal
    closeModalBtn.addEventListener('click', fecharModal);

    successModal.addEventListener('click', (e) => {
        // Se o clique foi no fundo (success-modal) e não no card, fecha o modal
        if (e.target === successModal) {
            fecharModal();
        }
    });

    async function baixarCracha(element, filename) {
        const estavaVirado = crachaContainer.classList.contains('virado');
        const querVerso = element.id === 'cracha-verso';

        if (querVerso && !estavaVirado) {
            crachaContainer.classList.add('virado');
            await new Promise(r => setTimeout(r, 650));
        } else if (!querVerso && estavaVirado) {
            crachaContainer.classList.remove('virado');
            await new Promise(r => setTimeout(r, 650));
        }

        try {
            const canvas = await html2canvas(element, {
                useCORS: true,
                backgroundColor: null,
                scale: 2
            });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = filename;
            link.click();
        } catch (error) {
            console.error("Erro ao baixar crachá:", error);
        } finally {
            if (querVerso && !estavaVirado) {
                crachaContainer.classList.remove('virado');
            } else if (!querVerso && estavaVirado) {
                crachaContainer.classList.add('virado');
            }
        }
    }

    baixarFrenteBtn.addEventListener('click', () => {
        baixarCracha(crachaFrente, 'cracha-frente-rfec.png');
    });

    baixarVersoBtn.addEventListener('click', () => {
        baixarCracha(crachaVerso, 'cracha-verso-rfec.png');
    });

    socialQrInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const qrDataUrl = event.target.result;
                socialQr.src = qrDataUrl;
                socialQr.className = "w-24 h-24 object-contain";
                socialQrContainer.className = "mt-4 w-24 h-24 flex items-center justify-center";
                salvarDados(nomeInput.value.trim(), null, qrDataUrl);
            };
            reader.readAsDataURL(file);
        } else {
            socialQr.src = "assets/imgs/logo.png";
            socialQr.className = "w-16 h-16 object-contain";
            socialQrContainer.className = "mt-4 w-20 h-20 flex items-center justify-center rounded-full bg-[#2b84fa] p-3 shadow-lg";
            salvarDados(nomeInput.value.trim(), null, null);
        }
    });

    // Inicialização
    carregarDados();
    lucide.createIcons();
});
