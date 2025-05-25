export type Language = 'ru' | 'kk'

export const translations = {
  ru: {
    // Header
    appTitle: 'RTMP → RTSP Конвертер',
    appDescription: 'Конвертация видеопотоков из RTMP в RTSP формат',

    // Theme
    lightTheme: 'Светлая тема',
    darkTheme: 'Темная тема',

    // Language
    language: 'Язык',
    russian: 'Русский',
    kazakh: 'Казахский',

    // Stream Form
    createNewStream: 'Создать новый поток',
    fillFormToCreate: 'Заполните форму для создания нового потока',
    streamName: 'Название потока',
    streamNamePlaceholder: 'Мой поток',
    rtmpUrl: 'RTMP URL (опционально)',
    rtmpUrlPlaceholder: 'rtmp://example.com/live/stream',
    rtmpUrlHint: 'Если не указан, будет создан локальный RTMP-адрес',
    creating: 'Создание...',
    createStream: 'Создать поток',

    // Stream List
    activeStreams: 'Активные потоки',
    refresh: 'Обновить',
    noActiveStreams: 'Нет активных потоков',

    // Stream Card
    createdAt: 'Создан',
    rtmpUrlLabel: 'RTMP URL:',
    rtspUrlLabel: 'RTSP URL:',
    copy: 'Копировать',
    start: 'Запустить',
    stop: 'Остановить',
    delete: 'Удалить',
    deleteConfirm: 'Вы уверены, что хотите удалить этот поток?',
    showPlayer: 'Показать плеер',
    hidePlayer: 'Скрыть плеер',

    // Stream Status
    statusRunning: 'Работает',
    statusError: 'Ошибка',
    statusStopped: 'Остановлен',
    statusIdle: 'Ожидание',

    // RTSP Player
    loading: 'Загрузка...',
    rtspPlayerTitle: 'RTSP Плеер',
    rtspPlayerUrlLabel: 'URL',
    rtspPlayerNote: 'Примечание: Для работы плеера требуется библиотека воспроизведения видео',
    playerError: 'Ошибка инициализации плеера',

    // How To Use
    howToUse: 'Как использовать',
    step1Title: '1. Создайте новый поток',
    step1Description: 'Заполните форму выше, указав название потока и опционально RTMP URL источника.',
    step2Title: '2. Отправьте RTMP-поток',
    step2Description: 'Используйте OBS Studio или другое программное обеспечение для отправки RTMP-потока на указанный URL.',
    step3Title: '3. Получите доступ к RTSP-потоку',
    step3Description: 'Используйте VLC или другой RTSP-совместимый плеер для просмотра конвертированного потока.',
    vlcExample: 'Пример команды для просмотра через VLC:',
    ffplayExample: 'Пример команды для просмотра через FFplay:',

    // Toasts
    success: 'Успех',
    error: 'Ошибка',
    streamCreatedSuccess: 'Поток "{name}" создан успешно',
    failedToCreateStream: 'Не удалось создать поток',
    streamStartedSuccess: 'Поток запущен успешно',
    failedToStartStream: 'Не удалось запустить поток',
    streamStoppedSuccess: 'Поток остановлен успешно',
    failedToStopStream: 'Не удалось остановить поток',
    streamDeletedSuccess: 'Поток удален успешно',
    failedToDeleteStream: 'Не удалось удалить поток',
    failedToLoadStreams: 'Не удалось загрузить потоки',
    copied: 'Скопировано!',
    urlCopied: '{label} скопирован в буфер обмена',
    failedToCopy: 'Не удалось скопировать URL',

    // Footer
    copyright: 'RTMP to RTSP Converter © 2025'
  },
  kk: {
    // Header
    appTitle: 'RTMP → RTSP Түрлендіргіш',
    appDescription: 'RTMP форматынан RTSP форматына бейне ағындарын түрлендіру',

    // Theme
    lightTheme: 'Жарық тақырып',
    darkTheme: 'Қараңғы тақырып',

    // Language
    language: 'Тіл',
    russian: 'Орысша',
    kazakh: 'Қазақша',

    // Stream Form
    createNewStream: 'Жаңа ағын жасау',
    fillFormToCreate: 'Жаңа ағын жасау үшін форманы толтырыңыз',
    streamName: 'Ағын атауы',
    streamNamePlaceholder: 'Менің ағыным',
    rtmpUrl: 'RTMP URL (міндетті емес)',
    rtmpUrlPlaceholder: 'rtmp://example.com/live/stream',
    rtmpUrlHint: 'Егер көрсетілмесе, жергілікті RTMP мекенжайы жасалады',
    creating: 'Жасалуда...',
    createStream: 'Ағын жасау',

    // Stream List
    activeStreams: 'Белсенді ағындар',
    refresh: 'Жаңарту',
    noActiveStreams: 'Белсенді ағындар жоқ',

    // Stream Card
    createdAt: 'Жасалған',
    rtmpUrlLabel: 'RTMP URL:',
    rtspUrlLabel: 'RTSP URL:',
    copy: 'Көшіру',
    start: 'Бастау',
    stop: 'Тоқтату',
    delete: 'Жою',
    deleteConfirm: 'Бұл ағынды жойғыңыз келетініне сенімдісіз бе?',
    showPlayer: 'Плеерді көрсету',
    hidePlayer: 'Плеерді жасыру',

    // Stream Status
    statusRunning: 'Жұмыс істеуде',
    statusError: 'Қате',
    statusStopped: 'Тоқтатылды',
    statusIdle: 'Күту',

    // RTSP Player
    loading: 'Жүктелуде...',
    rtspPlayerTitle: 'RTSP Плеер',
    rtspPlayerUrlLabel: 'URL',
    rtspPlayerNote: 'Ескерту: Плеердің жұмыс істеуі үшін бейне ойнату кітапханасы қажет',
    playerError: 'Плеерді іске қосу қатесі',

    // How To Use
    howToUse: 'Қалай қолдану керек',
    step1Title: '1. Жаңа ағын жасаңыз',
    step1Description: 'Жоғарыдағы форманы толтырып, ағын атауын және қосымша RTMP URL көзін көрсетіңіз.',
    step2Title: '2. RTMP ағынын жіберіңіз',
    step2Description: 'Көрсетілген URL-ге RTMP ағынын жіберу үшін OBS Studio немесе басқа бағдарламалық жасақтаманы пайдаланыңыз.',
    step3Title: '3. RTSP ағынына қол жеткізіңіз',
    step3Description: 'Түрлендірілген ағынды көру үшін VLC немесе басқа RTSP үйлесімді ойнатқышты пайдаланыңыз.',
    vlcExample: 'VLC арқылы көру үшін команда мысалы:',
    ffplayExample: 'FFplay арқылы көру үшін команда мысалы:',

    // Toasts
    success: 'Сәтті',
    error: 'Қате',
    streamCreatedSuccess: '"{name}" ағыны сәтті жасалды',
    failedToCreateStream: 'Ағын жасау сәтсіз аяқталды',
    streamStartedSuccess: 'Ағын сәтті басталды',
    failedToStartStream: 'Ағынды бастау сәтсіз аяқталды',
    streamStoppedSuccess: 'Ағын сәтті тоқтатылды',
    failedToStopStream: 'Ағынды тоқтату сәтсіз аяқталды',
    streamDeletedSuccess: 'Ағын сәтті жойылды',
    failedToDeleteStream: 'Ағынды жою сәтсіз аяқталды',
    failedToLoadStreams: 'Ағындарды жүктеу сәтсіз аяқталды',
    copied: 'Көшірілді!',
    urlCopied: '{label} алмасу буферіне көшірілді',
    failedToCopy: 'URL көшіру сәтсіз аяқталды',

    // Footer
    copyright: 'RTMP to RTSP Түрлендіргіш © 2025'
  }
}
