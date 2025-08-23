document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Inicialização dos ícones Lucide  ---
  try {
    lucide.createIcons();
  } catch (e) {
    console.error("Ocorreu um erro ao inicializar os ícones Lucide:", e);
  }


  // --- 2. Lógica do modo escuro (DARK MODE) ---
  const themeToggleBtn = document.getElementById('darkToggle');
  const htmlElement = document.documentElement; 

  // Função que aplica o tema desejado adicionando ou removendo a classe 'dark' do HTML
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  };

  // Função que alterna o tema atual e salva a preferência no localStorage
  const toggleTheme = () => {
    const currentTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme); 
    applyTheme(currentTheme);
  };

  // Adiciona o evento de clique ao botão de alternância de tema
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  } else {
    console.error("Botão de toggle do tema (darkToggle) não encontrado.");
  }

  // Verifica se há um tema salvo no localStorage
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    applyTheme(savedTheme);

  } else {
    applyTheme('light');
  }

});
