import * as pdfjsLib from '../vendor/pdfjs/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/vendor/pdfjs/pdf.worker.mjs';

const params = new URLSearchParams(window.location.search);
const source = params.get('file') || '';
const title = (params.get('title') || '论文在线预览').slice(0, 180);
const allowedHosts = new Set(['raw.githubusercontent.com', 'cdn.jsdelivr.net']);
const canvas = document.querySelector('#pdf-canvas');
const context = canvas.getContext('2d', { alpha: false });
const status = document.querySelector('#viewer-status');
const pageNumber = document.querySelector('#page-number');
const pageCount = document.querySelector('#page-count');
const previousButton = document.querySelector('#prev-page');
const nextButton = document.querySelector('#next-page');
const zoomOutButton = document.querySelector('#zoom-out');
const zoomInButton = document.querySelector('#zoom-in');
let documentHandle = null;
let currentPage = 1;
let scale = 1.25;
let rendering = false;
let pendingPage = null;

document.title = `${title} | 在线预览`;
document.querySelector('#document-title').textContent = title;

function fail(message) {
    status.textContent = message;
    status.classList.add('is-error');
    status.hidden = false;
    canvas.hidden = true;
}

function validatedSource(value) {
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) return '';
        return url.href;
    } catch {
        return '';
    }
}

async function renderPage(number) {
    if (!documentHandle || rendering) {
        pendingPage = number;
        return;
    }
    rendering = true;
    const page = await documentHandle.getPage(number);
    const viewport = page.getViewport({ scale });
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    await page.render({
        canvasContext: context,
        viewport,
        transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0],
    }).promise;
    currentPage = number;
    pageNumber.textContent = String(currentPage);
    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= documentHandle.numPages;
    status.hidden = true;
    canvas.hidden = false;
    rendering = false;
    if (pendingPage !== null && pendingPage !== currentPage) {
        const nextPage = pendingPage;
        pendingPage = null;
        await renderPage(nextPage);
    }
}

async function loadDocument() {
    const safeSource = validatedSource(source);
    if (!safeSource) {
        fail('论文地址无效或不在允许的文件来源中。');
        return;
    }
    try {
        const loadingTask = pdfjsLib.getDocument({ url: safeSource, withCredentials: false });
        loadingTask.onPassword = (submitPassword, reason) => {
            const message = reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD
                ? '密码不正确，请重新输入 PDF 阅读密码：'
                : '该 PDF 已加密，请输入阅读密码：';
            const password = window.prompt(message);
            if (password === null) {
                loadingTask.destroy();
                fail('已取消密码输入，无法打开这份论文。');
                return;
            }
            submitPassword(password);
        };
        documentHandle = await loadingTask.promise;
        pageCount.textContent = String(documentHandle.numPages);
        await renderPage(1);
    } catch (error) {
        console.error(error);
        fail('论文暂时无法加载。请检查文件是否公开、地址是否有效，或稍后重试。');
    }
}

previousButton.addEventListener('click', () => currentPage > 1 && renderPage(currentPage - 1));
nextButton.addEventListener('click', () => documentHandle && currentPage < documentHandle.numPages && renderPage(currentPage + 1));
zoomOutButton.addEventListener('click', () => {
    scale = Math.max(.65, scale - .15);
    renderPage(currentPage);
});
zoomInButton.addEventListener('click', () => {
    scale = Math.min(2.5, scale + .15);
    renderPage(currentPage);
});

window.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && ['p', 's'].includes(event.key.toLowerCase())) {
        event.preventDefault();
    }
    if (event.key === 'ArrowLeft' && currentPage > 1) renderPage(currentPage - 1);
    if (event.key === 'ArrowRight' && documentHandle && currentPage < documentHandle.numPages) renderPage(currentPage + 1);
});

loadDocument();
