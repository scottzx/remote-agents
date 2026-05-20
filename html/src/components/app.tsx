import { h, Component } from 'preact';

import { Terminal } from './terminal';

import type { ITerminalOptions, ITheme } from '@xterm/xterm';
import type { ClientOptions, FlowControl } from './terminal/xterm';

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const path = window.location.pathname.replace(/[/]+$/, '');
const wsUrl = [protocol, '//', window.location.host, path, '/ws', window.location.search].join('');
const tokenUrl = [window.location.protocol, '//', window.location.host, path, '/token'].join('');

const clientOptions = {
    rendererType: 'webgl',
    disableLeaveAlert: false,
    disableResizeOverlay: false,
    enableZmodem: false,
    enableTrzsz: false,
    enableSixel: false,
    closeOnDisconnect: false,
    isWindows: false,
    unicodeVersion: '11',
} as ClientOptions;

const flowControl = {
    limit: 100000,
    highWater: 10,
    lowWater: 4,
} as FlowControl;

const lightTermTheme = {
    foreground: '#1f2328',
    background: '#fafafa',
    cursor: '#1f2328',
    black: '#1f2328',
    red: '#cf222e',
    green: '#1a7f37',
    yellow: '#9a6700',
    blue: '#0969da',
    magenta: '#8250df',
    cyan: '#1b7c83',
    white: '#ffffff',
    brightBlack: '#6e7781',
    brightRed: '#d1242f',
    brightGreen: '#2da44e',
    brightYellow: '#b48600',
    brightBlue: '#2188ff',
    brightMagenta: '#a371f7',
    brightCyan: '#31929a',
    brightWhite: '#ffffff',
} as ITheme;

const darkTermTheme = {
    foreground: '#d2d2d2',
    background: '#0d1117',
    cursor: '#adadad',
    black: '#000000',
    red: '#d81e00',
    green: '#5ea702',
    yellow: '#cfae00',
    blue: '#427ab3',
    magenta: '#89658e',
    cyan: '#00a7aa',
    white: '#dbded8',
    brightBlack: '#686a66',
    brightRed: '#f54235',
    brightGreen: '#99e343',
    brightYellow: '#fdeb61',
    brightBlue: '#84b0d8',
    brightMagenta: '#bc94b7',
    brightCyan: '#37e6e8',
    brightWhite: '#f1f1f0',
} as ITheme;

const baseTermOptions = {
    fontSize: 13,
    fontFamily: 'JetBrains Mono, Consolas, Liberation Mono, Menlo, monospace',
    allowProposedApi: true,
} as ITerminalOptions;

interface WorkspaceFolder {
    id: string;
    name: string;
    expanded: boolean;
    children: Array<{
        id: string;
        title: string;
        time: string;
        active?: boolean;
    }>;
}

interface ProjectFile {
    path: string;
    name: string;
    size: string;
    type: 'file' | 'folder';
    indent: number;
    content: string;
}

// Built-in actual project source files for dynamic and highly responsive frontend previews
const projectFiles: ProjectFile[] = [
    {
        path: 'README.md',
        name: 'README.md',
        size: '5.4 KB',
        type: 'file',
        indent: 0,
        content:
            '# ttyd - Share your terminal over the web\n\nttyd is a simple command-line tool for sharing terminal over the web.\n\n## Features\n- Built on top of libuv and WebGL2 for speed\n- Fully-featured terminal with CJK and IME support\n- ZMODEM / trzsz file transfer support\n- Sixel image output support\n- SSL support based on OpenSSL / Mbed TLS\n- Run any custom command with options',
    },
    {
        path: 'package.json',
        name: 'package.json',
        size: '2.1 KB',
        type: 'file',
        indent: 0,
        content:
            '{\n  "private": true,\n  "name": "ttyd",\n  "version": "1.0.0",\n  "description": "Share your terminal over the web",\n  "scripts": {\n    "start": "webpack serve",\n    "build": "webpack && gulp",\n    "fix": "gts fix"\n  },\n  "dependencies": {\n    "@xterm/xterm": "^5.5.0",\n    "preact": "^10.19.6",\n    "trzsz": "^1.1.5"\n  }\n}',
    },
    {
        path: 'CMakeLists.txt',
        name: 'CMakeLists.txt',
        size: '4.4 KB',
        type: 'file',
        indent: 0,
        content:
            'cmake_minimum_required(VERSION 3.10)\nproject(ttyd C)\n\nset(CMAKE_C_STANDARD 99)\nset(CMAKE_C_STANDARD_REQUIRED ON)\n\nfind_package(Libwebsockets REQUIRED)\nfind_package(Libuv REQUIRED)\nfind_package(OpenSSL REQUIRED)\n\nadd_executable(ttyd src/main.c src/utils.c)\ntarget_link_libraries(ttyd Libwebsockets::websockets Libuv::uv OpenSSL::SSL)',
    },
    {
        path: 'html/src/components',
        name: 'html/src/components',
        size: '',
        type: 'folder',
        indent: 0,
        content: '',
    },
    {
        path: 'html/src/components/app.tsx',
        name: 'app.tsx',
        size: '25.9 KB',
        type: 'file',
        indent: 1,
        content:
            'import { h, Component } from \'preact\';\nimport { Terminal } from \'./terminal\';\n\nexport class App extends Component {\n    render() {\n        return (\n            <div class="app-container">\n                <header class="global-header">...</header>\n                <main class="workspace-body">...</main>\n            </div>\n        );\n    }\n}',
    },
    {
        path: 'html/src/style/index.scss',
        name: 'index.scss',
        size: '8.2 KB',
        type: 'file',
        indent: 1,
        content:
            'html, body {\n  height: 100%;\n  margin: 0;\n  overflow: hidden;\n}\n\n.app-container {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n}',
    },
];

interface AppState {
    activeTab: 'terminal' | 'agents' | 'console' | 'folders' | 'settings';
    rightPanelTab: 'files' | 'tasks';
    theme: 'light' | 'dark';
    hostname: string;
    leftSidebarOpen: boolean;
    rightSidebarOpen: boolean;
    folders: WorkspaceFolder[];
    selectedFile: ProjectFile | null;
}

export class App extends Component<{}, AppState> {
    constructor() {
        super();
        this.state = {
            activeTab: 'terminal',
            rightPanelTab: 'files',
            theme: 'light',
            hostname: 'Ashley Walker',
            leftSidebarOpen: true,
            rightSidebarOpen: true,
            selectedFile: projectFiles[0], // Pre-select README.md by default
            folders: [
                {
                    id: 'remote-agents',
                    name: 'remote-agents',
                    expanded: true,
                    children: [
                        { id: 'f-custom', title: 'Frontend Customization G...', time: '2m', active: false },
                        { id: 'a-terminal', title: 'Analyzing Web Terminal...', time: '11m', active: true },
                    ],
                },
                {
                    id: 'bee-write-back',
                    name: 'bee-write-back',
                    expanded: false,
                    children: [{ id: 'a-bee', title: 'Analyzing Bee Write Back', time: '3h' }],
                },
                {
                    id: 'cc-connect',
                    name: 'cc-connect',
                    expanded: false,
                    children: [{ id: 'a-cc', title: '帮我分析一下这个项目。理...', time: '4h' }],
                },
                {
                    id: 'html-slides',
                    name: 'html-slides',
                    expanded: false,
                    children: [
                        { id: 'a-slide-1', title: 'Designing Agent Collabor...', time: '18h' },
                        { id: 'a-slide-2', title: 'Designing Agent Collabor...', time: '18h' },
                    ],
                },
                {
                    id: 'html-anything',
                    name: 'html-anything',
                    expanded: false,
                    children: [{ id: 'a-anything', title: 'Querying LLM Usage', time: '1d' }],
                },
            ],
        };
    }

    componentDidMount() {
        const savedTheme = localStorage.getItem('remote-agents-theme') as 'light' | 'dark' | null;
        const theme = savedTheme || 'light';
        this.setState({ theme });
        document.documentElement.setAttribute('data-theme', theme);
        this.setState({ hostname: window.location.hostname || 'Ashley Walker' });
    }

    toggleTheme = () => {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.setState({ theme: newTheme });
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('remote-agents-theme', newTheme);
        this.triggerTerminalFit();
    };

    triggerTerminalFit = () => {
        setTimeout(() => {
            if (window.term && window.term.fit) {
                window.term.fit();
            }
        }, 150);
    };

    setActiveTab = (tab: 'terminal' | 'agents' | 'console' | 'folders' | 'settings') => {
        this.setState({ activeTab: tab });
        if (tab === 'terminal') {
            this.triggerTerminalFit();
        }
    };

    setRightPanelTab = (tab: 'files' | 'tasks') => {
        this.setState({ rightPanelTab: tab });
    };

    toggleLeftSidebar = () => {
        this.setState({ leftSidebarOpen: !this.state.leftSidebarOpen });
        this.triggerTerminalFit();
    };

    toggleRightSidebar = () => {
        this.setState({ rightSidebarOpen: !this.state.rightSidebarOpen });
        this.triggerTerminalFit();
    };

    toggleFolder = (folderId: string) => {
        this.setState({
            folders: this.state.folders.map(f => (f.id === folderId ? { ...f, expanded: !f.expanded } : f)),
        });
    };

    selectFile = (file: ProjectFile) => {
        if (file.type === 'file') {
            this.setState({ selectedFile: file });
        }
    };

    // Sophisticated JSX-based token parser for syntax-highlighting files inside dynamic previews
    renderHighlightedCode(content: string) {
        const lines = content.split('\n');
        return lines.map((line, idx) => {
            const renderedText: Array<h.JSX.Element | string> = [];

            // Standard light regex-based tokenization for presentation styling
            const parts = line.split(/(\s+)/);
            parts.forEach((part, pIdx) => {
                if (
                    /^(import|export|class|const|return|function|public|private|type|interface|void|async|await|let|var|set)$/.test(
                        part
                    )
                ) {
                    renderedText.push(
                        <span key={pIdx} class="kw">
                            {part}
                        </span>
                    );
                } else if (/^("[^"]*"|'[^']*'|`[^`]*`)$/.test(part)) {
                    renderedText.push(
                        <span key={pIdx} class="str">
                            {part}
                        </span>
                    );
                } else if (/^\/\/.*$/.test(part) || /^\/\*.*$/.test(part) || /^#.*$/.test(part)) {
                    renderedText.push(
                        <span key={pIdx} class="cm">
                            {part}
                        </span>
                    );
                } else if (/^(<[^>]+>)$/.test(part)) {
                    renderedText.push(
                        <span key={pIdx} class="tag">
                            {part}
                        </span>
                    );
                } else {
                    renderedText.push(part);
                }
            });

            return (
                <div key={idx} class="code-line">
                    <span class="line-number">{idx + 1}</span>
                    <span class="line-text">{renderedText}</span>
                </div>
            );
        });
    }

    render() {
        const { activeTab, rightPanelTab, theme, hostname, leftSidebarOpen, rightSidebarOpen, folders, selectedFile } =
            this.state;
        const currentTheme = theme === 'light' ? lightTermTheme : darkTermTheme;
        const termOptions = {
            ...baseTermOptions,
            theme: currentTheme,
        } as ITerminalOptions;

        return (
            <div class="app-container">
                {/* 1. Global Header Bar */}
                <header class="global-header">
                    <div class="header-left">
                        <div class="home-btn" title="返回首页">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <div class="divider" />
                        <span class="project-title" title={`${hostname}的智能体`}>
                            {hostname}的智能体
                        </span>
                        <div class="badge-ops">
                            <div class="pulse-dot" />
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span>AI 运维</span>
                        </div>
                    </div>

                    <div class="header-center">
                        <div
                            class={`nav-tab ${activeTab === 'agents' ? 'active' : ''}`}
                            onClick={() => this.setActiveTab('agents')}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M12 8V4H8" />
                                <rect width="16" height="12" x="4" y="8" rx="2" />
                                <path d="M2 14h2" />
                                <path d="M20 14h2" />
                                <path d="M15 13v2" />
                                <path d="M9 13v2" />
                            </svg>
                            <span>智能体</span>
                        </div>
                        <div
                            class={`nav-tab ${activeTab === 'console' ? 'active' : ''}`}
                            onClick={() => this.setActiveTab('console')}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                            <span>控制台</span>
                        </div>
                        <div
                            class={`nav-tab ${activeTab === 'folders' ? 'active' : ''}`}
                            onClick={() => this.setActiveTab('folders')}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
                            </svg>
                            <span>文件夹</span>
                        </div>
                        <div
                            class={`nav-tab ${activeTab === 'terminal' ? 'active' : ''}`}
                            onClick={() => this.setActiveTab('terminal')}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m7 8 3 2-3 2" />
                                <path d="M12 12h4" />
                            </svg>
                            <span>终端</span>
                        </div>
                        <div
                            class={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => this.setActiveTab('settings')}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>设置</span>
                        </div>
                    </div>

                    <div class="header-right">
                        <button
                            class="theme-toggle-btn"
                            onClick={this.toggleTheme}
                            title={theme === 'light' ? '深色模式' : '浅色模式'}
                        >
                            {theme === 'light' ? (
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                </svg>
                            ) : (
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                </svg>
                            )}
                        </button>
                        <button class="btn-primary">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M5 12h14M12 5v14" />
                            </svg>
                            <span>新建智能体</span>
                        </button>
                        <div class="more-options-btn">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                            </svg>
                        </div>
                        <div class="user-avatar" title="个人主页">
                            <div class="avatar-placeholder" />
                        </div>
                    </div>
                </header>

                {/* 3. Three-Column Grid Workspace Area */}
                <div class="workspace-body">
                    {/* [COLUMN 1]: LEFT Side workspaces Tree sidebar */}
                    <aside class={`left-sidebar ${leftSidebarOpen ? '' : 'collapsed'}`}>
                        <div class="sidebar-header">
                            <button class="new-conv-btn">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M5 12h14M12 5v14" />
                                </svg>
                                <span>新建会话</span>
                            </button>
                            <div class="history-title-container">
                                <span>历史会话</span>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                        </div>

                        <div class="sidebar-scroll">
                            <div class="workspace-section">
                                <div class="section-header">
                                    <span>工作空间 Workspaces</span>
                                    <div class="header-actions">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <path d="M3 16h10M3 12h18M3 8h18" />
                                        </svg>
                                    </div>
                                </div>

                                {folders.map(folder => (
                                    <div key={folder.id} class="project-node">
                                        <div
                                            class={`project-folder ${folder.expanded ? 'expanded' : ''}`}
                                            onClick={() => this.toggleFolder(folder.id)}
                                        >
                                            <svg
                                                class="chevron"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2.5"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                            <svg
                                                class="folder-icon"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
                                            </svg>
                                            <span>{folder.name}</span>
                                        </div>

                                        {folder.expanded && (
                                            <div class="project-children">
                                                {folder.children.map(child => (
                                                    <div
                                                        key={child.id}
                                                        class={`chat-item ${child.active ? 'active' : ''}`}
                                                    >
                                                        <span class="chat-title" title={child.title}>
                                                            {child.title}
                                                        </span>
                                                        <span class="chat-time">{child.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div class="sidebar-footer">
                            <div class="footer-item">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                <span>Settings</span>
                            </div>
                            <div class="footer-item">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <span>Provide Feedback</span>
                            </div>
                        </div>
                    </aside>

                    {/* [COLUMN 2]: MIDDLE main workspace Terminal container */}
                    <main class="middle-canvas">
                        {/* Terminal specific subheader toolbar */}
                        <div class="terminal-toolbar">
                            <div class="toolbar-left">
                                <button
                                    class="sidebar-toggle-btn"
                                    onClick={this.toggleLeftSidebar}
                                    title={leftSidebarOpen ? '收起左侧栏' : '展开左侧栏'}
                                >
                                    {leftSidebarOpen ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    )}
                                </button>
                                <h2 class="page-title">终端</h2>
                            </div>

                            <div class="toolbar-right">
                                <div class="shell-selector" title="选择 Shell 终端">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <polyline points="4 17 10 11 4 5" />
                                        <line x1="12" x2="20" y1="19" y2="19" />
                                    </svg>
                                    <span>bash</span>
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                                <button class="tool-btn" title="添加新标签页">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M5 12h14M12 5v14" />
                                    </svg>
                                </button>
                                <button class="tool-btn" title="分屏显示">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <rect width="18" height="18" x="3" y="3" rx="2" />
                                        <line x1="12" x2="12" y1="3" y2="21" />
                                    </svg>
                                </button>
                                <button class="tool-btn btn-danger" title="终止并清理当前终端">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        <line x1="10" x2="10" y1="11" y2="17" />
                                        <line x1="14" x2="14" y1="11" y2="17" />
                                    </svg>
                                </button>
                                <button
                                    class="tool-btn"
                                    onClick={this.toggleRightSidebar}
                                    title={rightSidebarOpen ? '收起右侧栏' : '展开右侧栏'}
                                >
                                    {rightSidebarOpen ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Card wrapper containing the actual Web terminal canvas */}
                        <div class="terminal-card">
                            {activeTab === 'terminal' ? (
                                <Terminal
                                    id="terminal-container"
                                    wsUrl={wsUrl}
                                    tokenUrl={tokenUrl}
                                    clientOptions={clientOptions}
                                    termOptions={termOptions}
                                    flowControl={flowControl}
                                />
                            ) : (
                                <div
                                    class="placeholder-view"
                                    style="margin: 0; border: none; border-radius: 0; height: 100%;"
                                >
                                    <svg
                                        class="placeholder-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m7 8 3 2-3 2" />
                                        <path d="M12 12h4" />
                                    </svg>
                                    <h3 class="placeholder-title">终端就绪</h3>
                                    <p class="placeholder-desc">在全局导航栏中点击【终端】以开始交互会话。</p>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* [COLUMN 3]: RIGHT Side dynamic panel */}
                    <aside class={`right-panel ${rightSidebarOpen ? '' : 'collapsed'}`}>
                        <div class="panel-tabs-header">
                            <span
                                class={`panel-tab-btn ${rightPanelTab === 'files' ? 'active' : ''}`}
                                onClick={() => this.setRightPanelTab('files')}
                            >
                                文件预览 (Files)
                            </span>
                            <span
                                class={`panel-tab-btn ${rightPanelTab === 'tasks' ? 'active' : ''}`}
                                onClick={() => this.setRightPanelTab('tasks')}
                            >
                                任务追踪 (Tasks)
                            </span>
                        </div>

                        <div class="panel-body-scroll">
                            {rightPanelTab === 'files' && (
                                <div style="display: flex; flex-direction: column; gap: 16px;">
                                    {/* Project File Tree Browser */}
                                    <div class="file-tree-container">
                                        {projectFiles.map(file => (
                                            <div
                                                key={file.path}
                                                class={`file-node indent-${file.indent} ${
                                                    selectedFile?.path === file.path ? 'active' : ''
                                                }`}
                                                onClick={() => this.selectFile(file)}
                                            >
                                                {file.type === 'folder' ? (
                                                    <svg
                                                        class="folder-icon"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    >
                                                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        class="file-icon"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    >
                                                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                                    </svg>
                                                )}
                                                <span class="file-name">{file.name}</span>
                                                {file.size && <span class="file-size">{file.size}</span>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* High fidelity syntax preview card */}
                                    {selectedFile && (
                                        <div class="code-preview-card">
                                            <div class="preview-header">
                                                <span class="preview-title">{selectedFile.path}</span>
                                                <div
                                                    class="preview-close"
                                                    onClick={() => this.setState({ selectedFile: null })}
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    >
                                                        <line x1="18" x2="6" y1="6" y2="18" />
                                                        <line x1="6" x2="18" y1="6" y2="18" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <pre class="preview-content">
                                                {this.renderHighlightedCode(selectedFile.content)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {rightPanelTab === 'tasks' && (
                                <div class="task-list-container">
                                    <div class="task-item completed">
                                        <svg
                                            class="check-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 8 12 12 14 14" />
                                        </svg>
                                        <span>分析终端页面布局并制定三栏式重构方案</span>
                                    </div>
                                    <div class="task-item completed">
                                        <svg
                                            class="check-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 8 12 12 14 14" />
                                        </svg>
                                        <span>构建极简 Workspaces 侧边栏文件树架构</span>
                                    </div>
                                    <div class="task-item completed">
                                        <svg
                                            class="check-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 8 12 12 14 14" />
                                        </svg>
                                        <span>设计右侧三栏动态面板，集成代码高亮预览器</span>
                                    </div>
                                    <div class="task-item completed">
                                        <svg
                                            class="check-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 8 12 12 14 14" />
                                        </svg>
                                        <span>支持终端左右侧边栏的响应式折叠逻辑系统</span>
                                    </div>
                                    <div class="task-item completed">
                                        <svg
                                            class="check-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 8 12 12 14 14" />
                                        </svg>
                                        <span>完成 TypeScript 全局构建与本地交付验证</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        );
    }
}
