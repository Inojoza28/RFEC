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
    const excluirFotoBtn = document.getElementById('excluir-foto');
    const excluirQrBtn = document.getElementById('excluir-qr');
    
    let isFrente = true; // Estado de rotação

    // Função de Feedback Rápido (Toast)
        function exibirToast(mensagem) {
        const toast = document.getElementById('feedback-toast');
        
        // 1. Define a mensagem
        toast.textContent = mensagem;
        
        // 2. Torna o toast visível e o move para cima
        toast.classList.remove('opacity-0');
        toast.style.transform = 'translate(-50%, -10px)';
        
        // 3. Esconde o toast após 3 segundos
        setTimeout(() => {
            toast.classList.add('opacity-0');
            toast.style.transform = 'translate(-50%, 0)';
        }, 3000); 
    }


    // ================================================================
    // Funções para redefinir as imagens
    // ================================================================
    function resetarFoto() {
        // Remove do localStorage
        localStorage.removeItem('fotoUsuario');
        
        // Reseta o preview para o ícone padrão
        fotoPreview.innerHTML = `<div class="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl"></div><i data-lucide="user" class="w-14 h-14 text-gray-500 relative z-10"></i>`;
        lucide.createIcons(); // Recria o ícone
        
        // Limpa o valor do input de arquivo
        fotoInput.value = '';
    }

    function resetarQrCode() {
    // Remove do localStorage
    localStorage.removeItem('socialQr');
    
    // Reseta a imagem para o logo padrão
    socialQr.src = "assets/imgs/logo.png";
    
    socialQr.className = "w-16 h-16 object-contain"; // Estilo do logo dentro do círculo
    socialQrContainer.className = "mt-4 w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 p-3 shadow-lg"; // Estilo do container com fundo azul
    
    // Limpa o valor do input de arquivo
    socialQrInput.value = '';
}

    // ================================================================
    // Função para redimensionar imagem mantendo qualidade (formato circular)
    // ================================================================
    function redimensionarImagem(file, targetSize, quality = 0.9) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const { width, height } = img;
                
                // Define o canvas como quadrado para evitar achatamento
                canvas.width = targetSize;
                canvas.height = targetSize;
                
                // Melhora a qualidade da renderização
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Calcula o crop para manter proporção quadrada (center crop)
                const size = Math.min(width, height);
                const offsetX = (width - size) / 2;
                const offsetY = (height - size) / 2;
                
                // Desenha a imagem cortada em formato quadrado
                ctx.drawImage(
                    img,
                    offsetX, offsetY, size, size,  // área de origem (crop quadrado)
                    0, 0, targetSize, targetSize   // área de destino (quadrado)
                );
                
                // Converte para base64 com qualidade alta
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

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

    // Lógica da Foto de Perfil
    if (fotoSalva) {
        fotoPreview.innerHTML = `<img src="${fotoSalva}" alt="Foto do usuário" class="w-full h-full object-cover rounded-full" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; aspect-ratio: 1/1;">`;
    } else {
        // Se não houver foto salva, chama a função de reset da FOTO.
        resetarFoto(); 
    }

    // Lógica do QR Code
    if (socialQrSalvo) {
        socialQr.src = socialQrSalvo;
        socialQr.className = "w-24 h-24 object-contain"; // QR maior
        socialQrContainer.className = "mt-4 w-24 h-24 flex items-center justify-center"; 
    } else {
        // Se não houver QR salvo, chama a função de reset do QR CODE.
        resetarQrCode(); 
    }
}
    // ================================================================
    // EVENTOS PARA OS BOTÕES DE EXCLUSÃO
    // ================================================================
    excluirFotoBtn.addEventListener('click', () => {
        resetarFoto();
        exibirToast('✅ Foto removida com sucesso.'); 
    });

    excluirQrBtn.addEventListener('click', () => {
        resetarQrCode();
        exibirToast('✅ Foto removida com sucesso.');
    });

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
    formCracha.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = nomeInput.value.trim();
        const arquivoFoto = fotoInput.files[0];

        if (arquivoFoto) {
            try {
                // Redimensiona a imagem mantendo alta qualidade (formato quadrado)
                const fotoOtimizada = await redimensionarImagem(arquivoFoto, 600, 0.95);
                salvarDados(nome, fotoOtimizada);
                carregarDados();
                exibirFeedback();
            } catch (error) {
                console.error('Erro ao processar imagem:', error);
                // Fallback para o método original
                const reader = new FileReader();
                reader.onload = (event) => {
                    salvarDados(nome, event.target.result);
                    carregarDados();
                    exibirFeedback();
                };
                reader.readAsDataURL(arquivoFoto);
            }
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

    fotoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Pré-visualização também com qualidade otimizada
                const fotoOtimizada = await redimensionarImagem(file, 400, 0.9);
                fotoPreview.innerHTML = `<img src="${fotoOtimizada}" alt="Foto do usuário" class="w-full h-full object-cover" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">`;
            } catch (error) {
                console.error('Erro ao processar preview:', error);
                // Fallback para método original
                const reader = new FileReader();
                reader.onload = (ev) => {
                    fotoPreview.innerHTML = `<img src="${ev.target.result}" alt="Foto do usuário" class="w-full h-full object-cover" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">`;
                };
                reader.readAsDataURL(file);
            }
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
            // Configurações otimizadas para html2canvas
            const canvas = await html2canvas(element, {
                useCORS: true,
                backgroundColor: null,
                scale: 3, // Aumentado para melhor qualidade
                width: element.offsetWidth,
                height: element.offsetHeight,
                scrollX: 0,
                scrollY: 0,
                allowTaint: true,
                imageTimeout: 0,
                logging: false,
                onclone: (clonedDoc) => {
                // 1) Força boa renderização das imagens no clone
                const imgs = clonedDoc.querySelectorAll('img');
                imgs.forEach(img => {
                    img.style.imageRendering = '-webkit-optimize-contrast';
                    img.style.imageRendering = 'crisp-edges';
                });

                // 2) Adiciona classe "apertada" só no clone
                const frenteClonada = clonedDoc.getElementById('cracha-frente');
                if (frenteClonada) frenteClonada.classList.add('export-tight');

                // 3) Injeta CSS que vale apenas no clone durante a exportação
                const style = clonedDoc.createElement('style');
                style.textContent = `
                #cracha-frente.export-tight #foto-preview {
                    margin-bottom: 0.75rem !important;
                }
                #cracha-frente.export-tight #nome-cracha {
                    margin-top: 0 !important;
                    line-height: 1.1 !important;
                }
                /* Aqui aumentamos mais a distância do nome para o "Membro Oficial" */
                #cracha-frente.export-tight #membro-status {
                    margin-top: 1.25rem !important; /* antes era 0.75rem */
                }
                #cracha-frente.export-tight #social-qr-container {
                    margin-top: 1.5rem !important;
                }
                `;
                clonedDoc.head.appendChild(style);
                }

            });

            // Cria um novo canvas com melhor compressão
            const finalCanvas = document.createElement('canvas');
            const ctx = finalCanvas.getContext('2d');
            
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;
            
            // Configurações para melhor qualidade
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Desenha o canvas original no final
            ctx.drawImage(canvas, 0, 0);
            
            const link = document.createElement('a');
            link.href = finalCanvas.toDataURL('image/png', 1.0); // Qualidade máxima
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

    socialQrInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const qrOtimizado = await redimensionarImagem(file, 300, 0.95);
                socialQr.src = qrOtimizado;
                socialQr.className = "w-24 h-24 object-contain";
                socialQrContainer.className = "mt-4 w-24 h-24 flex items-center justify-center";
                salvarDados(nomeInput.value.trim(), null, qrOtimizado);
            } catch (error) {
                console.error('Erro ao processar QR:', error);
                // Fallback
                const reader = new FileReader();
                reader.onload = (event) => {
                    const qrDataUrl = event.target.result;
                    socialQr.src = qrDataUrl;
                    socialQr.className = "w-24 h-24 object-contain";
                    socialQrContainer.className = "mt-4 w-24 h-24 flex items-center justify-center";
                    salvarDados(nomeInput.value.trim(), null, qrDataUrl);
                };
                reader.readAsDataURL(file);
            }
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