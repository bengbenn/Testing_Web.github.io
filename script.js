document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const incomeInput = document.getElementById('incomeInput');
  const startDateInput = document.getElementById('startDateInput');
  const endDateInput = document.getElementById('endDateInput');
  const totalDaysEl = document.getElementById('totalDays');
  const dailyBudgetEl = document.getElementById('dailyBudget');
  const remainingDaysEl = document.getElementById('remainingDays');
  const totalAllocatedEl = document.getElementById('totalAllocated');
  const unallocatedAmountEl = document.getElementById('unallocatedAmount');
  const budgetItemsContainer = document.getElementById('budgetItemsContainer');
  const warningsSection = document.getElementById('warningsSection');
  const warningsList = document.getElementById('warningsList');
  const downloadTxtBtn = document.getElementById('downloadTxtBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  // Initial budget items
  let budgetItems = [
    { id: 1, name: 'Makan & Minum', icon: '🍽️', percentage: 35 },
    { id: 2, name: 'Transportasi', icon: '🚌', percentage: 20 },
    { id: 3, name: 'Kuliah & Belajar', icon: '📚', percentage: 15 },
    { id: 4, name: 'Hiburan', icon: '🎭', percentage: 10 },
    { id: 5, name: 'Kesehatan', icon: '💊', percentage: 10 },
    { id: 6, name: 'Tabungan', icon: '💰', percentage: 10 }
  ];

  let income = 2000000;
  let startDate = '';
  let endDate = '';

  // Set default dates to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  startDateInput.value = firstDay.toISOString().split('T')[0];
  endDateInput.value = lastDay.toISOString().split('T')[0];

  startDate = startDateInput.value;
  endDate = endDateInput.value;

  // Update UI when inputs change
  incomeInput.value = income;
  incomeInput.addEventListener('input', (e) => {
    income = parseInt(e.target.value) || 0;
    renderBudgetItems();
    updateCalculations();
  });

  startDateInput.addEventListener('change', (e) => {
    startDate = e.target.value;
    updateCalculations();
  });

  endDateInput.addEventListener('change', (e) => {
    endDate = e.target.value;
    updateCalculations();
  });

  // Render budget items dynamically
  function renderBudgetItems() {
    budgetItemsContainer.innerHTML = '';

    budgetItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'budget-item';
      div.innerHTML = `
        <div>
          <span>${item.icon}</span>
          <strong>${item.name}</strong>
        </div>
        <div>
          <input
            type="number"
            value="${item.percentage}"
            data-id="${item.id}"
            min="0"
            max="100"
          />
          <span>%</span>
          <span>Rp ${getBudgetAmount(item.percentage).toLocaleString('id-ID')}</span>
        </div>
      `;
      budgetItemsContainer.appendChild(div);
    });

    // Add event listeners to percentage inputs
    document.querySelectorAll('#budgetItemsContainer input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const newValue = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
        budgetItems = budgetItems.map(item =>
          item.id === id ? { ...item, percentage: newValue } : item
        );
        updateCalculations();
      });
    });
  }

  // Calculate budget amount
  function getBudgetAmount(percentage) {
    return Math.floor((income * percentage) / 100);
  }

  // Update all calculations
  function updateCalculations() {
    if (!startDate || !endDate || income <= 0) {
      totalDaysEl.textContent = '0 hari';
      dailyBudgetEl.textContent = 'Rp 0';
      remainingDaysEl.textContent = '0 hari';
      totalAllocatedEl.textContent = 'Rp 0';
      unallocatedAmountEl.textContent = 'Rp 0';
      warningsSection.classList.add('hidden');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)) + 1);
    const dailyBudget = remainingDays > 0 ? Math.floor(income / totalDays) : 0;

    totalDaysEl.textContent = `${totalDays} hari`;
    dailyBudgetEl.textContent = `Rp ${dailyBudget.toLocaleString('id-ID')}`;
    remainingDaysEl.textContent = `${remainingDays} hari`;

    const totalAllocated = budgetItems.reduce((sum, item) => sum + getBudgetAmount(item.percentage), 0);
    const unallocated = income - totalAllocated;

    totalAllocatedEl.textContent = `Rp ${totalAllocated.toLocaleString('id-ID')}`;
    unallocatedAmountEl.textContent = `Rp ${unallocated.toLocaleString('id-ID')}`;

    // Update warnings
    const warnings = [];
    const totalPercentage = budgetItems.reduce((sum, item) => sum + item.percentage, 0);

    if (totalPercentage > 100) {
      warnings.push('Total persentase melebihi 100%! Kurangi alokasi anggaran.');
    } else if (totalPercentage < 100) {
      warnings.push(`Ada ${100 - totalPercentage}% anggaran yang belum dialokasikan.`);
    }

    if (income < 500000) {
      warnings.push('Penghasilan bulanan Anda cukup rendah. Pertimbangkan untuk menambah penghasilan.');
    }

    if (warnings.length > 0) {
      warningsList.innerHTML = warnings.map(w => `<li>${w}</li>`).join('');
      warningsSection.classList.remove('hidden');
    } else {
      warningsSection.classList.add('hidden');
    }
  }

  // Download TXT report
  downloadTxtBtn.addEventListener('click', () => {
    const report = [
      'LAPORAN ANGGARAN BULANAN',
      '=======================',
      `Penghasilan: Rp ${income.toLocaleString('id-ID')}`,
      `Periode: ${startDate} - ${endDate}`,
      `Total Hari: ${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1}`,
      `Budget Harian: Rp ${parseInt(dailyBudgetEl.textContent.replace(/[^\d]/g, ''))}`,
      '',
      'Alokasi:',
      ...budgetItems.map(item => `  - ${item.name}: ${item.percentage}% (Rp ${getBudgetAmount(item.percentage).toLocaleString('id-ID')})`),
      '',
      `Total Dialokasikan: Rp ${parseInt(totalAllocatedEl.textContent.replace(/[^\d]/g, ''))}`,
      `Belum Dialokasikan: Rp ${parseInt(unallocatedAmountEl.textContent.replace(/[^\d]/g, ''))}`,
      '',
      'Peringatan:',
      ...Array.from(warningsList.children).map(li => `  - ${li.textContent}`)
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Download PDF report
  downloadPdfBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      alert('jsPDF tidak ditemukan.');
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('LAPORAN ANGGARAN BULANAN', 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.text(`Penghasilan: Rp ${income.toLocaleString('id-ID')}`, 10, y);
    y += 7;
    doc.text(`Periode: ${startDate} - ${endDate}`, 10, y);
    y += 7;
    doc.text(`Total Hari: ${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1}`, 10, y);
    y += 7;
    doc.text(`Budget Harian: Rp ${parseInt(dailyBudgetEl.textContent.replace(/[^\d]/g, ''))}`, 10, y);
    y += 10;

    doc.text('Alokasi:', 10, y);
    y += 7;
    budgetItems.forEach(item => {
      doc.text(`  - ${item.name}: ${item.percentage}% (Rp ${getBudgetAmount(item.percentage).toLocaleString('id-ID')})`, 10, y);
      y += 7;
    });

    y += 5;
    doc.text(`Total Dialokasikan: Rp ${parseInt(totalAllocatedEl.textContent.replace(/[^\d]/g, ''))}`, 10, y);
    y += 7;
    doc.text(`Belum Dialokasikan: Rp ${parseInt(unallocatedAmountEl.textContent.replace(/[^\d]/g, ''))}`, 10, y);
    y += 10;

    doc.text('Peringatan:', 10, y);
    y += 7;
    Array.from(warningsList.children).forEach(li => {
      doc.text(`  - ${li.textContent}`, 10, y);
      y += 7;
    });

    doc.save('budget-report.pdf');
  });

  // Initial render
  renderBudgetItems();
  updateCalculations();
});