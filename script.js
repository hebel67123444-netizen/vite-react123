// 刷题应用的JavaScript代码
class QuizApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.favoriteQuestions = new Set();
        this.userAnswers = {};
        this.mode = 'all'; // 'all' 或 'favorite'
        this.filteredQuestions = [];
        
        // 初始化DOM元素
        this.initElements();
        // 加载数据
        this.loadData();
        // 绑定事件
        this.bindEvents();
    }
    
    initElements() {
        // 题目相关元素
        this.questionType = document.getElementById('questionType');
        this.questionNumber = document.getElementById('questionNumber');
        this.questionContent = document.getElementById('questionContent');
        this.options = document.getElementById('options');
        this.resultSection = document.getElementById('resultSection');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultText = document.getElementById('resultText');
        this.analysis = document.getElementById('analysis');
        this.analysisContent = document.getElementById('analysisContent');
        
        // 按钮相关元素
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.favoriteIcon = document.getElementById('favoriteIcon');
        
        // 菜单相关元素
        this.menuBtn = document.getElementById('menuBtn');
        this.closeMenuBtn = document.getElementById('closeMenuBtn');
        this.menu = document.getElementById('menu');
        this.overlay = document.getElementById('overlay');
        this.allQuestionsBtn = document.getElementById('allQuestionsBtn');
        this.judgeQuestionsBtn = document.getElementById('judgeQuestionsBtn');
        this.favoriteQuestionsBtn = document.getElementById('favoriteQuestionsBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.favoriteCount = document.getElementById('favoriteCount');
        this.judgeCount = document.getElementById('judgeCount');
    }
    
    async loadData() {
        try {
            // 加载题目数据
            const response = await fetch('questions.json');
            this.questions = await response.json();
            
            // 加载判断题题库
            try {
                const judgeResponse = await fetch('judge_questions.json');
                this.judgeQuestions = await judgeResponse.json();
            } catch (judgeError) {
                console.error('加载判断题题库失败，将从全部题目中筛选:', judgeError);
                this.judgeQuestions = this.questions.filter(q => q.type === 'judge');
            }
            
            // 加载本地存储的数据
            this.loadFromLocalStorage();
            
            // 初始化显示
            this.updateFilteredQuestions();
            this.displayQuestion();
            this.updateFavoriteCount();
            this.updateJudgeCount();
        } catch (error) {
            console.error('加载数据失败:', error);
            alert('加载题目数据失败，请检查文件是否存在');
        }
    }
    
    bindEvents() {
        // 导航按钮事件
        this.prevBtn.addEventListener('click', () => this.prevQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        // 收藏按钮事件
        this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        
        // 菜单事件
        this.menuBtn.addEventListener('click', () => this.showMenu());
        this.closeMenuBtn.addEventListener('click', () => this.hideMenu());
        this.overlay.addEventListener('click', () => this.hideMenu());
        
        // 菜单选项事件
        this.allQuestionsBtn.addEventListener('click', () => this.switchMode('all'));
        this.judgeQuestionsBtn.addEventListener('click', () => this.switchMode('judge'));
        this.favoriteQuestionsBtn.addEventListener('click', () => this.switchMode('favorite'));
        this.saveBtn.addEventListener('click', () => this.saveToLocalStorage());
        this.clearBtn.addEventListener('click', () => this.clearLocalStorage());
        
        // 窗口关闭事件，自动保存
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());
    }
    
    updateFilteredQuestions() {
        if (this.mode === 'favorite') {
            this.filteredQuestions = this.questions.filter(q => this.favoriteQuestions.has(q.id));
        } else if (this.mode === 'judge') {
            this.filteredQuestions = [...this.judgeQuestions];
        } else {
            this.filteredQuestions = [...this.questions];
        }
        
        // 如果当前索引超出范围，重置为0
        if (this.currentQuestionIndex >= this.filteredQuestions.length) {
            this.currentQuestionIndex = 0;
        }
    }
    
    displayQuestion() {
        if (this.filteredQuestions.length === 0) {
            this.questionContent.textContent = '没有找到题目';
            this.options.innerHTML = '';
            this.resultSection.classList.remove('show');
            return;
        }
        
        const question = this.filteredQuestions[this.currentQuestionIndex];
        
        // 更新题目类型
        this.questionType.textContent = question.type === 'choice' ? '单选题' : '判断题';
        
        // 更新题目数量
        this.questionNumber.textContent = `${this.currentQuestionIndex + 1}/${this.filteredQuestions.length}`;
        
        // 更新题目内容
        this.questionContent.textContent = question.content;
        
        // 更新选项
        this.options.innerHTML = '';
        
        if (question.type === 'judge') {
            // 判断题选项：对(A)和错(B)
            const judgeOptions = ['对', '错'];
            const optionLabels = ['A', 'B'];
            
            judgeOptions.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.option = optionLabels[index];
                optionElement.innerHTML = `<div class="option-text">${option}</div>`;
                
                // 检查是否有用户答案
                if (this.userAnswers[question.id] === optionLabels[index]) {
                    optionElement.classList.add('selected');
                }
                
                // 添加点击事件
                optionElement.addEventListener('click', () => this.selectOption(question.id, optionLabels[index]));
                
                this.options.appendChild(optionElement);
            });
        } else {
            // 单选题选项
            const optionLabels = ['A', 'B', 'C', 'D'];
            
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.option = optionLabels[index];
                optionElement.innerHTML = `<div class="option-text">${option}</div>`;
                
                // 检查是否有用户答案
                if (this.userAnswers[question.id] === optionLabels[index]) {
                    optionElement.classList.add('selected');
                }
                
                // 添加点击事件
                optionElement.addEventListener('click', () => this.selectOption(question.id, optionLabels[index]));
                
                this.options.appendChild(optionElement);
            });
        }
        
        // 更新收藏图标
        this.updateFavoriteIcon();
        
        // 显示结果（如果已经回答过）
        if (this.userAnswers[question.id]) {
            this.showResult(question, this.userAnswers[question.id]);
        } else {
            this.resultSection.classList.remove('show');
        }
    }
    
    selectOption(questionId, selectedOption) {
        const question = this.filteredQuestions[this.currentQuestionIndex];
        
        // 保存用户答案
        this.userAnswers[questionId] = selectedOption;
        
        // 更新选项样式
        const options = this.options.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('selected', 'correct', 'wrong');
        });
        
        const selectedOptionElement = this.options.querySelector(`[data-option="${selectedOption}"]`);
        selectedOptionElement.classList.add('selected');
        
        // 显示结果
        this.showResult(question, selectedOption);
        
        // 如果回答正确，自动跳转到下一题（延迟1秒）
        if (selectedOption === question.answer) {
            setTimeout(() => {
                this.nextQuestion();
            }, 1000);
        }
    }
    
    showResult(question, selectedOption) {
        const isCorrect = selectedOption === question.answer;
        
        // 更新结果图标和文本
        this.resultIcon.className = `result-icon ${isCorrect ? 'correct' : 'wrong'}`;
        this.resultIcon.textContent = isCorrect ? '✓' : '✗';
        this.resultText.textContent = isCorrect ? '回答正确！' : '回答错误！';
        
        // 更新选项样式
        const options = this.options.querySelectorAll('.option');
        options.forEach(option => {
            const optionLabel = option.dataset.option;
            if (optionLabel === question.answer) {
                option.classList.add('correct');
            } else if (optionLabel === selectedOption) {
                option.classList.add('wrong');
            }
        });
        
        // 更新解析
        if (question.analysis) {
            this.analysisContent.textContent = question.analysis;
            this.analysis.style.display = 'block';
        } else {
            this.analysis.style.display = 'none';
        }
        
        // 显示结果区域
        this.resultSection.classList.add('show');
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.filteredQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    }
    
    toggleFavorite() {
        const question = this.filteredQuestions[this.currentQuestionIndex];
        const questionId = question.id;
        
        if (this.favoriteQuestions.has(questionId)) {
            this.favoriteQuestions.delete(questionId);
        } else {
            this.favoriteQuestions.add(questionId);
        }
        
        this.updateFavoriteIcon();
        this.updateFavoriteCount();
        this.saveToLocalStorage();
    }
    
    updateFavoriteIcon() {
        const question = this.filteredQuestions[this.currentQuestionIndex];
        const questionId = question.id;
        
        if (this.favoriteQuestions.has(questionId)) {
            this.favoriteIcon.textContent = '★';
            this.favoriteIcon.style.color = '#f39c12';
        } else {
            this.favoriteIcon.textContent = '☆';
            this.favoriteIcon.style.color = 'inherit';
        }
    }
    
    updateFavoriteCount() {
        this.favoriteCount.textContent = this.favoriteQuestions.size;
    }
    
    updateJudgeCount() {
        this.judgeCount.textContent = this.judgeQuestions.length;
    }
    
    showMenu() {
        this.menu.classList.add('show');
        this.overlay.classList.add('show');
    }
    
    hideMenu() {
        this.menu.classList.remove('show');
        this.overlay.classList.remove('show');
    }
    
    switchMode(mode) {
        this.mode = mode;
        
        // 更新菜单样式
        this.allQuestionsBtn.classList.toggle('active', mode === 'all');
        this.judgeQuestionsBtn.classList.toggle('active', mode === 'judge');
        this.favoriteQuestionsBtn.classList.toggle('active', mode === 'favorite');
        
        // 更新题目列表
        this.currentQuestionIndex = 0;
        this.updateFilteredQuestions();
        this.displayQuestion();
        
        // 隐藏菜单
        this.hideMenu();
    }
    
    saveToLocalStorage() {
        const data = {
            currentQuestionIndex: this.currentQuestionIndex,
            favoriteQuestions: Array.from(this.favoriteQuestions),
            userAnswers: this.userAnswers,
            mode: this.mode
        };
        
        localStorage.setItem('quizData', JSON.stringify(data));
        alert('答题记录已保存！');
    }
    
    loadFromLocalStorage() {
        const data = localStorage.getItem('quizData');
        if (data) {
            const parsedData = JSON.parse(data);
            this.currentQuestionIndex = parsedData.currentQuestionIndex || 0;
            this.favoriteQuestions = new Set(parsedData.favoriteQuestions || []);
            this.userAnswers = parsedData.userAnswers || {};
            this.mode = parsedData.mode || 'all';
        }
    }
    
    clearLocalStorage() {
        if (confirm('确定要清除所有答题记录吗？')) {
            localStorage.removeItem('quizData');
            this.currentQuestionIndex = 0;
            this.favoriteQuestions.clear();
            this.userAnswers = {};
            this.mode = 'all';
            this.updateFilteredQuestions();
            this.displayQuestion();
            this.updateFavoriteCount();
            this.updateFavoriteIcon();
            alert('答题记录已清除！');
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});