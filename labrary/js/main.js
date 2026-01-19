// ===== نظام يعتمد كلياً على ملفات JSON =====

const CONFIG = {
    dataFolder: 'data/',
    autoSave: true,
    files: {
        users: 'users.json',
        subjects: 'subjects.json',
        resources: 'resources.json',
        currentUser: 'current_user.json'
    }
};

// بيانات المثال (للحالات الطارئة فقط)
const defaultUsers = [
    {
        id: 1,
        username: "ahmed123",
        password: "password123",
        fullName: "أحمد محمد علي",
        stage: "1",
        createdAt: "2023-01-15"
    },
    {
        id: 2,
        username: "admin",
        password: "admin123",
        fullName: "مسؤول النظام",
        stage: "admin",
        createdAt: "2023-01-01"
    }
];

const defaultSubjects = [
    {
        id: 'IT101',
        name: 'مقدمة في البرمجة',
        stage: '1',
        description: 'مقدمة في أساسيات البرمجة والخوارزميات',
        resourcesCount: 2
    },
    {
        id: 'IT102',
        name: 'الرياضيات المنفصلة',
        stage: '1',
        description: 'الأسس الرياضية للحوسبة',
        resourcesCount: 1
    },
    {
        id: 'IT201',
        name: 'برمجة الويب',
        stage: '2',
        description: 'برمجة مواقع الويب باستخدام HTML, CSS, JavaScript',
        resourcesCount: 1
    },
    {
        id: 'IT202',
        name: 'قواعد البيانات',
        stage: '2',
        description: 'تصميم قواعد البيانات العلائقية',
        resourcesCount: 0
    }
];

const defaultResources = [
    {
        id: 'R001',
        subjectId: 'IT101',
        title: 'كتاب مقدمة في البرمجة',
        type: 'pdf',
        url: '#',
        description: 'كتاب شامل للمفاهيم الأساسية',
        uploadDate: '2023-09-15',
        size: '2.4 MB'
    },
    {
        id: 'R002',
        subjectId: 'IT101',
        title: 'تمارين محلولة',
        type: 'docx',
        url: '#',
        description: 'مجموعة تمارين مع الحلول',
        uploadDate: '2023-09-20',
        size: '1.8 MB'
    },
    {
        id: 'R003',
        subjectId: 'IT201',
        title: 'دليل HTML و CSS',
        type: 'pdf',
        url: '#',
        description: 'دليل شامل لتصميم الويب',
        uploadDate: '2023-10-10',
        size: '3.8 MB'
    }
];

// ===== الدوال الأساسية للقراءة والكتابة =====
async function loadJSON(fileName, fallbackData = []) {
    try {
        const response = await fetch(`${CONFIG.dataFolder}${fileName}`);
        if (!response.ok) throw new Error('File not found');
        return await response.json();
    } catch (error) {
        console.warn(`⚠️ ملف ${fileName} غير موجود، استخدام بيانات افتراضية`);
        return fallbackData;
    }
}

async function saveJSON(fileName, data) {
    try {
        // في بيئة حقيقية، هنا ترفع البيانات للسيرفر
        // لكن للـ frontend فقط، سنستخدم localStorage كـ cache
        localStorage.setItem(fileName, JSON.stringify(data));
        
        // عرض البيانات كملف للتنزيل (حل مؤقت)
        if (CONFIG.autoSave) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // حفظ كـ cache لتطوير أسرع
            sessionStorage.setItem(`file_cache_${fileName}`, JSON.stringify(data));
            
            console.log(`📁 ${fileName} جاهز للتنزيل (حل تطوير)`);
            
            // في الإنتاج، هنا ترسل fetch للسيرفر
            // await fetch('/api/save-data', { method: 'POST', body: JSON.stringify({fileName, data}) });
        }
        return true;
    } catch (error) {
        console.error(`❌ خطأ في حفظ ${fileName}:`, error);
        return false;
    }
}

// ===== تهيئة الملفات =====
async function initializeData() {
    console.log('🔧 جاري تهيئة النظام من ملفات JSON...');
    
    // التحقق من وجود الملفات أو إنشائها
    const filesToInit = [
        { file: CONFIG.files.users, data: defaultUsers },
        { file: CONFIG.files.subjects, data: defaultSubjects },
        { file: CONFIG.files.resources, data: defaultResources }
    ];
    
    for (const { file, data } of filesToInit) {
        const existing = await loadJSON(file);
        if (existing.length === 0) {
            await saveJSON(file, data);
        }
    }
    
    console.log('✅ التهيئة اكتملت');
}

// ===== تحميل البيانات =====
async function loadUsers() {
    return await loadJSON(CONFIG.files.users, defaultUsers);
}

async function loadSubjects() {
    return await loadJSON(CONFIG.files.subjects, defaultSubjects);
}

async function loadResources() {
    return await loadJSON(CONFIG.files.resources, defaultResources);
}

// ===== حفظ البيانات =====
async function saveUsers(users) {
    return await saveJSON(CONFIG.files.users, users);
}

async function saveSubjects(subjects) {
    return await saveJSON(CONFIG.files.subjects, subjects);
}

async function saveResources(resources) {
    return await saveJSON(CONFIG.files.resources, resources);
}

// ===== نظام المصادقة =====
async function login(username, password) {
    const users = await loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // حفظ المستخدم الحالي في localStorage للجلسة
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // توجيه حسب نوع المستخدم
        if (user.stage === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'student.html';
        }
        return true;
    }
    return false;
}

async function register(fullName, username, password, stage) {
    const users = await loadUsers();
    
    // التحقق من عدم تكرار اسم المستخدم
    if (users.some(u => u.username === username)) {
        return { success: false, message: 'اسم المستخدم موجود مسبقاً' };
    }
    
    // إنشاء مستخدم جديد
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password,
        fullName,
        stage,
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    await saveUsers(users);
    
    return { success: true, message: 'تم إنشاء الحساب بنجاح' };
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// ===== إدارة المواد =====
async function getSubjectsByStage(stage) {
    const subjects = await loadSubjects();
    return subjects.filter(subject => subject.stage === stage);
}

async function addSubject(subjectData) {
    const subjects = await loadSubjects();
    
    // التحقق من عدم تكرار رمز المادة
    if (subjects.some(s => s.id === subjectData.id)) {
        return false;
    }
    
    subjects.push({
        ...subjectData,
        resourcesCount: 0
    });
    
    await saveSubjects(subjects);
    return true;
}

async function deleteSubjectFromStorage(subjectId) {
    const subjects = await loadSubjects();
    const resources = await loadResources();
    
    // البحث عن المادة
    const subjectIndex = subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) return false;
    
    // حذف المادة
    subjects.splice(subjectIndex, 1);
    
    // حذف جميع المصادر المرتبطة بالمادة
    const updatedResources = resources.filter(r => r.subjectId !== subjectId);
    
    await saveSubjects(subjects);
    await saveResources(updatedResources);
    return true;
}

// ===== إدارة المصادر =====
async function addResource(resourceData) {
    const resources = await loadResources();
    const subjects = await loadSubjects();
    
    // إضافة المصدر
    resources.push(resourceData);
    
    // تحديث عدد المصادر للمادة
    const subjectIndex = subjects.findIndex(s => s.id === resourceData.subjectId);
    if (subjectIndex !== -1) {
        subjects[subjectIndex].resourcesCount += 1;
    }
    
    await saveResources(resources);
    await saveSubjects(subjects);
    return true;
}

async function deleteResourceFromStorage(resourceId) {
    const resources = await loadResources();
    const subjects = await loadSubjects();
    
    // البحث عن المصدر
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    if (resourceIndex === -1) return false;
    
    const resource = resources[resourceIndex];
    
    // حذف المصدر
    resources.splice(resourceIndex, 1);
    
    // تحديث عدد المصادر للمادة
    const subjectIndex = subjects.findIndex(s => s.id === resource.subjectId);
    if (subjectIndex !== -1 && subjects[subjectIndex].resourcesCount > 0) {
        subjects[subjectIndex].resourcesCount -= 1;
    }
    
    await saveResources(resources);
    await saveSubjects(subjects);
    return true;
}

// ===== أدوات للمطور =====
async function exportAllData() {
    const data = {
        users: await loadUsers(),
        subjects: await loadSubjects(),
        resources: await loadResources(),
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library_backup_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function importData(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.users) await saveUsers(data.users);
                if (data.subjects) await saveSubjects(data.subjects);
                if (data.resources) await saveResources(data.resources);
                
                resolve({ success: true, message: 'تم استيراد البيانات بنجاح' });
            } catch (error) {
                resolve({ success: false, message: `خطأ في الملف: ${error.message}` });
            }
        };
        reader.readAsText(file);
    });
}

// ===== التهيئة عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', async function() {
    // تهيئة البيانات
    await initializeData();
    
    // تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (await login(username, password)) {
                alert('تم تسجيل الدخول بنجاح!');
            } else {
                alert('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        });
        
        // تبديل عرض كلمة المرور
        const toggleBtn = document.querySelector('.toggle-password');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    }
    
    // التسجيل الجديد
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const stage = document.getElementById('stage').value;
            
            const result = await register(fullName, username, password, stage);
            
            if (result.success) {
                alert(result.message);
                // تسجيل الدخول بعد التسجيل
                const loginSuccess = await login(username, password);
                if (!loginSuccess) {
                    alert('تم التسجيل بنجاح، يرجى تسجيل الدخول يدوياً');
                }
            } else {
                alert(result.message);
            }
        });
    }
    
    // تبديل بين النماذج
    const showRegister = document.getElementById('showRegister');
    const backToLogin = document.getElementById('backToLogin');
    
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
        });
    }
    
    if (backToLogin) {
        backToLogin.addEventListener('click', function() {
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        });
    }
    
    // إضافة زر تسجيل الخروج
    const logoutButtons = document.querySelectorAll('.logout');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
});

// ===== إعادة استخدام الدوال =====
window.login = login;
window.register = register;
window.logout = logout;
window.addSubject = addSubject;
window.addResource = addResource;
window.deleteSubjectFromStorage = deleteSubjectFromStorage;
window.deleteResourceFromStorage = deleteResourceFromStorage;
window.exportAllData = exportAllData;
window.importData = importData;
window.getCurrentUser = getCurrentUser;
window.getSubjectsByStage = getSubjectsByStage;
