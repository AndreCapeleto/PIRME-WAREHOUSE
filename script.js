document.addEventListener('DOMContentLoaded', () => {
    const operadores = JSON.parse(localStorage.getItem('operadores')) || [];
    const operadoresContainer = document.getElementById('operadoresContainer');
    const cadastrarBtn = document.getElementById('cadastrarBtn');
    const turnoSelect = document.getElementById('turnoSelect');
    const areaSelect = document.getElementById('areaSelect');
    const atividadeSelect = document.getElementById('atividadeSelect');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const cadastrarForm = document.getElementById('cadastrarForm');
    const operadorIndex = document.getElementById('operadorIndex');
    const fotoInput = document.getElementById('foto');
    const arquivoInput = document.getElementById('arquivoInput');

    function exibirOperadores(turno, area, atividade) {
        operadoresContainer.innerHTML = '';
        const operadoresFiltrados = operadores.filter(op => 
            (turno === 'todos' || op.turno === turno) &&
            (area === 'todas' || op.area === area) &&
            (atividade === 'todas' || op.atividade === atividade)
        );
        operadoresFiltrados.forEach((op, index) => {
            const operadorDiv = document.createElement('div');
            operadorDiv.classList.add('operador');
            operadorDiv.innerHTML = `
                <img src="${op.foto}" alt="Foto de ${op.nome}">
                <div class="info">
                    <h2>${op.nome}</h2>
                    <p>Turno: ${op.turno}</p>
                    <p>Área: ${op.area}</p>
                    <p>Atividade: ${op.atividade}</p>
                    <p>Rua: ${op.rua}</p>
                    <p>Líder: ${op.lider}</p>
                </div>
                <button class="edit-btn" data-index="${index}">Editar</button>
                <button class="delete-btn" data-index="${index}">Excluir</button>
            `;
            operadoresContainer.appendChild(operadorDiv);
        });
    }

    function openModal() {
        modal.style.display = 'block';
    }

    function closeModalFunc() {
        modal.style.display = 'none';
        cadastrarForm.reset();
        operadorIndex.value = '';
    }

    function cadastrarOperador(event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const turno = document.getElementById('turno').value;
        const area = document.getElementById('area').value;
        const atividade = document.getElementById('atividade').value;
        const rua = document.getElementById('rua').value;
        const lider = document.getElementById('lider').value;
        const fotoFile = fotoInput.files[0];
        let fotoURL = '';

        if (fotoFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                fotoURL = reader.result;
                salvarOperador(nome, turno, area, atividade, rua, lider, fotoURL);
            };
            reader.readAsDataURL(fotoFile);
        } else {
            fotoURL = operadores[operadorIndex.value]?.foto || '';
            salvarOperador(nome, turno, area, atividade, rua, lider, fotoURL);
        }
    }

    function salvarOperador(nome, turno, area, atividade, rua, lider, fotoURL) {
        const index = operadorIndex.value;
        const operador = { nome, turno, area, atividade, rua, lider, foto: fotoURL };

        if (index === '') {
            operadores.push(operador);
        } else {
            operadores[index] = operador;
        }

        localStorage.setItem('operadores', JSON.stringify(operadores));
        exibirOperadores(turnoSelect.value, areaSelect.value, atividadeSelect.value);
        closeModalFunc();
    }

    function excluirOperador(index) {
        operadores.splice(index, 1);
        localStorage.setItem('operadores', JSON.stringify(operadores));
        exibirOperadores(turnoSelect.value, areaSelect.value, atividadeSelect.value);
    }

    function carregarLista(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            json.forEach(op => {
                const operador = {
                    nome: op.Nome,
                    turno: op.Turno,
                    area: op.Area,
                    atividade: op.Atividade,
                    rua: op.Rua,
                    lider: op.Lider,
                    foto: op.Foto
                };
                const index = operadores.findIndex(o => o.nome === operador.nome);
                if (index !== -1) {
                    operadores[index] = operador;
                } else {
                    operadores.push(operador);
                }
            });

            localStorage.setItem('operadores', JSON.stringify(operadores));
            exibirOperadores(turnoSelect.value, areaSelect.value, atividadeSelect.value);
        };
        reader.readAsBinaryString(file);
    }

    cadastrarBtn.addEventListener('click', () => {
        openModal();
        document.getElementById('modalTitle').textContent = 'Cadastrar Operador';
    });

    closeModal.addEventListener('click', closeModalFunc);
    cadastrarForm.addEventListener('submit', cadastrarOperador);
    operadoresContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const index = event.target.dataset.index;
            const operador = operadores[index];
            document.getElementById('nome').value = operador.nome;
            document.getElementById('turno').value = operador.turno;
            document.getElementById('area').value = operador.area;
            document.getElementById('atividade').value = operador.atividade;
            document.getElementById('rua').value = operador.rua;
            document.getElementById('lider').value = operador.lider;
            operadorIndex.value = index;
            openModal();
            document.getElementById('modalTitle').textContent = 'Editar Operador';
        } else if (event.target.classList.contains('delete-btn')) {
            const index = event.target.dataset.index;
            excluirOperador(index);
        }
    });

    turnoSelect.addEventListener('change', () => {
        exibirOperadores(turnoSelect.value, areaSelect.value, atividadeSelect.value);
    });

    areaSelect.addEventListener('change', () => {
        exibirOperadores(turnoSelect.value, areaSelect.value, atividadeSelect.value);
    });

    atividadeSelect.addEventListener('change', () => {
        exibirOperadores(turnoSelect.value, areaSelect.value, atividadeSelect.value);
    });

    arquivoInput.addEventListener('change', carregarLista);

    exibirOperadores('todos', 'todas', 'todas');
});
