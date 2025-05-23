document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const createStreamForm = document.getElementById('createStreamForm');
    const streamNameInput = document.getElementById('streamName');
    const rtmpUrlInput = document.getElementById('rtmpUrl');
    const streamsList = document.getElementById('streamsList');
    const noStreamsMessage = document.getElementById('noStreamsMessage');
    const refreshBtn = document.getElementById('refreshBtn');
    const streamCardTemplate = document.getElementById('streamCardTemplate');

    // Загрузка списка потоков при загрузке страницы
    loadStreams();

    // Обработчик формы создания потока
    createStreamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const streamName = streamNameInput.value.trim();
        const rtmpUrl = rtmpUrlInput.value.trim();
        
        if (!streamName) {
            alert('Пожалуйста, введите название потока');
            return;
        }
        
        try {
            const response = await fetch('/api/streams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: streamName,
                    rtmpUrl: rtmpUrl || undefined
                })
            });
            
            if (!response.ok) {
                throw new Error('Ошибка при создании потока');
            }
            
            const stream = await response.json();
            
            // Очистка формы
            streamNameInput.value = '';
            rtmpUrlInput.value = '';
            
            // Обновление списка потоков
            loadStreams();
            
            alert(`Поток "${stream.name}" успешно создан!`);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Ошибка: ${error.message}`);
        }
    });

    // Обработчик кнопки обновления
    refreshBtn.addEventListener('click', loadStreams);

    // Функция загрузки списка потоков
    async function loadStreams() {
        try {
            const response = await fetch('/api/streams');
            
            if (!response.ok) {
                throw new Error('Ошибка при загрузке потоков');
            }
            
            const streams = await response.json();
            
            // Очистка списка потоков
            streamsList.innerHTML = '';
            
            if (streams.length === 0) {
                streamsList.appendChild(noStreamsMessage);
            } else {
                noStreamsMessage.remove();
                
                // Добавление потоков в список
                streams.forEach(stream => {
                    const streamCard = createStreamCard(stream);
                    streamsList.appendChild(streamCard);
                });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Ошибка при загрузке потоков: ${error.message}`);
        }
    }

    // Функция создания карточки потока
    function createStreamCard(stream) {
        const template = streamCardTemplate.content.cloneNode(true);
        const card = template.querySelector('.stream-card');
        
        // Установка ID
        card.dataset.streamId = stream.id;
        
        // Заполнение данных
        card.querySelector('.stream-name').textContent = stream.name;
        
        // Статус
        const statusBadge = card.querySelector('.status-badge');
        statusBadge.textContent = getStatusText(stream.status);
        statusBadge.classList.add(`status-${stream.status}`);
        
        // URLs
        card.querySelector('.rtmp-url').textContent = stream.rtmpUrl;
        card.querySelector('.rtsp-url').textContent = stream.rtspUrl;
        
        // Дата создания
        card.querySelector('.created-at').textContent = new Date(stream.createdAt).toLocaleString();
        
        // Кнопки копирования URL
        card.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const urlType = btn.dataset.urlType;
                const url = stream[`${urlType}Url`];
                
                navigator.clipboard.writeText(url)
                    .then(() => {
                        const originalText = btn.textContent;
                        btn.textContent = 'Скопировано!';
                        
                        setTimeout(() => {
                            btn.innerHTML = '<i class="bi bi-clipboard"></i> Копировать';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Ошибка при копировании:', err);
                        alert('Не удалось скопировать URL');
                    });
            });
        });
        
        // Кнопка запуска
        const startBtn = card.querySelector('.start-btn');
        startBtn.addEventListener('click', () => startStream(stream.id));
        startBtn.disabled = stream.status === 'running';
        
        // Кнопка остановки
        const stopBtn = card.querySelector('.stop-btn');
        stopBtn.addEventListener('click', () => stopStream(stream.id));
        stopBtn.disabled = stream.status !== 'running';
        
        // Кнопка удаления
        card.querySelector('.delete-btn').addEventListener('click', () => deleteStream(stream.id));
        
        return card;
    }

    // Функция запуска потока
    async function startStream(streamId) {
        try {
            const response = await fetch(`/api/streams/${streamId}/start`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Ошибка при запуске потока');
            }
            
            loadStreams();
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Ошибка при запуске потока: ${error.message}`);
        }
    }

    // Функция остановки потока
    async function stopStream(streamId) {
        try {
            const response = await fetch(`/api/streams/${streamId}/stop`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Ошибка при остановке потока');
            }
            
            loadStreams();
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Ошибка при остановке потока: ${error.message}`);
        }
    }

    // Функция удаления потока
    async function deleteStream(streamId) {
        if (!confirm('Вы уверены, что хотите удалить этот поток?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/streams/${streamId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Ошибка при удалении потока');
            }
            
            loadStreams();
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Ошибка при удалении потока: ${error.message}`);
        }
    }

    // Функция получения текстового представления статуса
    function getStatusText(status) {
        switch (status) {
            case 'idle':
                return 'Ожидание';
            case 'running':
                return 'Работает';
            case 'error':
                return 'Ошибка';
            case 'stopped':
                return 'Остановлен';
            default:
                return 'Неизвестно';
        }
    }

    // Автоматическое обновление списка потоков каждые 10 секунд
    setInterval(loadStreams, 10000);
});
