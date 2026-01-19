// ===== نظام المصادقة والبيانات =====

// بيانات المثال (سيتم حفظها في localStorage)
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

// تهيئة البيانات في localStorage
function initializeData() {
    if (!localStorage.getItem('itlibrary_users')) {
        localStorage.setItem('itlibrary_users', JSON.stringify(defaultUsers));
    }
    
    if (!localStorage.getItem('itlibrary_subjects')) {
        localStorage.setItem('itlibrary_subjects', JSON.stringify(defaultSubjects));
    }
    
    if (!localStorage.getItem('itlibrary_resources')) {
        localStorage.setItem('itlibrary_resources', JSON.stringify(defaultResources));
    }
}

// تحميل البيانات
function loadUsers() {
    return JSON.parse(localStorage.getItem('itlibrary_users')) || [];
}

function loadSubjects() {
    return JSON.parse(localStorage.getItem('itlibrary_subjects')) || [];
}

function loadResources() {
    return JSON.parse(localStorage.getItem('itlibrary_resources')) || [];
}

// حفظ البيانات
function saveUsers(users) {
    localStorage.setItem('itlibrary_users', JSON.stringify(users));
}

function saveSubjects(subjects) {
    localStorage.setItem('itlibrary_subjects', JSON.stringify(subjects));
}

function saveResources(resources) {
    localStorage.setItem('itlibrary_resources', JSON.stringify(resources));
}

// ===== نظام المصادقة =====
function login(username, password) {
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // حفظ المستخدم الحالي
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

function register(fullName, username, password, stage) {
    const users = loadUsers();
    
    // التحقق من عدم تكرار اسم المستخدم
    if (users.some(u => u.username === username)) {
        return { success: false, message: 'اسم المستخدم موجود مسبقاً' };
    }
    
    // إنشاء مستخدم جديد
    const newUser = {
        id: users.length + 1,
        username,
        password,
        fullName,
        stage,
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    saveUsers(users);
    
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
function getSubjectsByStage(stage) {
    const subjects = loadSubjects();
    return subjects.filter(subject => subject.stage === stage);
}

function addSubject(subjectData) {
    const subjects = loadSubjects();
    
    // التحقق من عدم تكرار رمز المادة
    if (subjects.some(s => s.id === subjectData.id)) {
        return false;
    }
    
    subjects.push({
        ...subjectData,
        resourcesCount: 0
    });
    
    saveSubjects(subjects);
    return true;
}

function deleteSubjectFromStorage(subjectId) {
    const subjects = loadSubjects();
    const resources = loadResources();
    
    // البحث عن المادة
    const subjectIndex = subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) return false;
    
    // حذف المادة
    subjects.splice(subjectIndex, 1);
    
    // حذف جميع المصادر المرتبطة بالمادة
    const updatedResources = resources.filter(r => r.subjectId !== subjectId);
    
    saveSubjects(subjects);
    saveResources(updatedResources);
    return true;
}

// ===== إدارة المصادر =====
function addResource(resourceData) {
    const resources = loadResources();
    const subjects = loadSubjects();
    
    // إضافة المصدر
    resources.push(resourceData);
    
    // تحديث عدد المصادر للمادة
    const subjectIndex = subjects.findIndex(s => s.id === resourceData.subjectId);
    if (subjectIndex !== -1) {
        subjects[subjectIndex].resourcesCount += 1;
    }
    
    saveResources(resources);
    saveSubjects(subjects);
    return true;
}

function deleteResourceFromStorage(resourceId) {
    const resources = loadResources();
    const subjects = loadSubjects();
    
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
    
    saveResources(resources);
    saveSubjects(subjects);
    return true;
}

// ===== التهيئة =====
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة البيانات
    initializeData();
    
    // تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (login(username, password)) {
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
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const stage = document.getElementById('stage').value;
            
            const result = register(fullName, username, password, stage);
            
            if (result.success) {
                alert(result.message);
                login(username, password);
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
// هذه الدوال متاحة للاستخدام في الملفات الأخرى
window.login = login;
window.register = register;
window.logout = logout;
window.addSubject = addSubject;
window.addResource = addResource;
window.deleteSubjectFromStorage = deleteSubjectFromStorage;
window.deleteResourceFromStorage = deleteResourceFromStorage;