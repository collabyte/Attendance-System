class ExecutiveMember {
    constructor(name, post) {
        this.name = name;
        this.post = post;
        this.absentCount = 0;
        this.totalAbsentDays = 0;
        this.totalPresentDays = 0;
        this.consecutiveAbsentDays = 0;
        this.isBlacklisted = false;
    }

    increaseAbsentCount() {
        this.absentCount++;
        this.totalAbsentDays++;
        this.consecutiveAbsentDays++;
    }

    resetConsecutiveAbsentDays() {
        this.consecutiveAbsentDays = 0;
    }
}


class AttendanceSystem {
    constructor() {
        this.loadMembers();
        this.updateUI();
    }

    loadMembers() {
        const members = JSON.parse(localStorage.getItem('members')) || [];
        this.members = members.reduce((acc, member) => {
            acc[member.name] = new ExecutiveMember(member.name, member.post);
            acc[member.name].absentCount = member.absentCount;
            acc[member.name].totalAbsentDays = member.totalAbsentDays;
            acc[member.name].totalPresentDays = member.totalPresentDays;
            acc[member.name].consecutiveAbsentDays = member.consecutiveAbsentDays;
            acc[member.name].isBlacklisted = member.isBlacklisted;
            return acc;
        }, {});
    }

    saveMembers() {
        localStorage.setItem('members', JSON.stringify(Object.values(this.members)));
        this.updateUI();
    }

    addMember(name, post) {
        if (!this.members[name]) {
            this.members[name] = new ExecutiveMember(name, post);
            this.saveMembers();
            alert(`${name} has been added.`);
        } else {
            alert(`${name} is already a member.`);
        }
    }

    recordAttendance(isPresent) {
        const checkboxes = document.querySelectorAll('#membersCheckboxes input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const name = checkbox.value;
                const member = this.members[name];
                if (member) {
                    if (isPresent) {
                        if (member.isBlacklisted) {
                            alert(`${name} is blacklisted. Reset blacklist before recording attendance.`);
                        } else {
                            member.totalPresentDays++;
                            member.resetConsecutiveAbsentDays();
                        }
                    } else {
                        member.increaseAbsentCount();
                        if (member.consecutiveAbsentDays >= 3) {
                            member.isBlacklisted = true;
                        }
                    }
                }
            }
        });
        this.saveMembers();
    }

    resetBlacklist(name) {
        if (this.members[name]) {
            const member = this.members[name];
            member.isBlacklisted = false;
            member.resetConsecutiveAbsentDays();
            this.saveMembers();
            alert(`${name}'s blacklist status has been reset.`);
        } else {
            alert(`${name} is not a member.`);
        }
    }

    deleteMember(name) {
        if (this.members[name]) {
            delete this.members[name];
            this.saveMembers();
            alert(`${name} has been removed.`);
        } else {
            alert(`${name} is not a member.`);
        }
    }

    editMember(oldName, newName, newPost) {
        if (this.members[oldName]) {
            if (oldName !== newName && this.members[newName]) {
                alert(`${newName} is already a member. Please choose a different name.`);
            } else {
                const member = this.members[oldName];
                delete this.members[oldName];
                member.name = newName;
                member.post = newPost;
                this.members[newName] = member;
                this.saveMembers();
                alert(`${oldName} has been updated to ${newName}.`);
            }
        } else {
            alert(`${oldName} is not a member.`);
        }
    }

    getBlacklistedMembers() {
        return Object.values(this.members).filter(member => member.isBlacklisted);
    }

    getAllMembers() {
        return Object.values(this.members).sort((a, b) => a.name.localeCompare(b.name));
    }

    updateUI() {
        if (document.getElementById('membersTable')) {
            const membersTable = document.getElementById('membersTable').getElementsByTagName('tbody')[0];
            membersTable.innerHTML = '';

            this.getAllMembers().forEach((member, index) => {
                const row = membersTable.insertRow();
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${member.name}</td>
                    <td>${member.post}</td>
                    <td>${member.totalPresentDays}</td>
                    <td>${member.totalAbsentDays}</td>
                    <td>${member.consecutiveAbsentDays}</td>
                    <td>${member.isBlacklisted ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="edit-button" onclick="editMember('${member.name}')">Edit</button>
                        <button onclick="deleteMember('${member.name}')">Delete</button>
                    </td>
                `;
            });

            document.getElementById('totalExecutives').textContent = Object.keys(this.members).length;
            this.showBlacklistedMembers();
        }
        this.updateMemberCheckboxes();
    }

    updateMemberCheckboxes() {
        if (document.getElementById('membersCheckboxes')) {
            const checkboxesContainer = document.getElementById('membersCheckboxes');
            checkboxesContainer.innerHTML = '';
            this.getAllMembers().forEach(member => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = member.name;
                checkbox.id = `checkbox-${member.name}`;
                const label = document.createElement('label');
                label.htmlFor = `checkbox-${member.name}`;
                label.textContent = member.name;
                checkboxesContainer.appendChild(checkbox);
                checkboxesContainer.appendChild(label);
                checkboxesContainer.appendChild(document.createElement('br'));
            });
        }
    }

    showBlacklistedMembers() {
        if (document.getElementById('blacklistedMembers')) {
            const blacklistedMembers = this.getBlacklistedMembers();
            document.getElementById('blacklistedMembers').innerHTML = blacklistedMembers.map(m => m.name).join(', ');
        }
    }

    showAttendance() {
        const searchName = document.getElementById('searchAttendanceName').value.trim();
        const members = this.getAllMembers().filter(member => member.name.includes(searchName));
        let attendanceInfo = '<table>';
        attendanceInfo += '<tr><th>Name</th><th>Post</th><th>Total Present</th><th>Total Absent</th><th>Consecutive Absent</th><th>Blacklisted</th></tr>';
        members.forEach(member => {
            attendanceInfo += `
                <tr>
                    <td>${member.name}</td>
                    <td>${member.post}</td>
                    <td>${member.totalPresentDays}</td>
                    <td>${member.totalAbsentDays}</td>
                    <td>${member.consecutiveAbsentDays}</td>
                    <td>${member.isBlacklisted ? 'Yes' : 'No'}</td>
                </tr>`;
        });
        attendanceInfo += '</table>';
        document.getElementById('attendanceList').innerHTML = attendanceInfo;
    }
}

// Instantiate the attendance system
const attendanceSystem = new AttendanceSystem();

function addMember() {
    const name = document.getElementById('memberName').value.trim();
    const post = document.getElementById('memberPost').value.trim();
    if (name && post) {
        attendanceSystem.addMember(name, post);
        document.getElementById('memberName').value = '';
        document.getElementById('memberPost').value = '';
    } else {
        alert('Please provide both name and post.');
    }
}

function recordAttendance(isPresent) {
    attendanceSystem.recordAttendance(isPresent);
}

function resetBlacklist() {
    const name = document.getElementById('resetName').value.trim();
    if (name) {
        attendanceSystem.resetBlacklist(name);
        document.getElementById('resetName').value = '';
    } else {
        alert('Please provide the name.');
    }
}

function deleteMember(name) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        attendanceSystem.deleteMember(name);
    }
}

function editMember(name) {
    const newName = prompt(`Enter new name for ${name}:`);
    const newPost = prompt(`Enter new post for ${name}:`);
    if (newName && newPost) {
        attendanceSystem.editMember(name, newName.trim(), newPost.trim());
    } else {
        alert('Please provide both name and post.');
    }
}
