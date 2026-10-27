import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BusinessIdea {
  id: string;
  title: string;
  problem: string;
  solution: string;
  market: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Incubating';
  score?: number;
  submittedDate: string;
}

interface Venture {
  id: string;
  name: string;
  founder: string;
  cohort: string;
  status: 'Incubating' | 'Graduated' | 'On Hold';
  milestonesCompleted: number;
  totalMilestones: number;
  fundingSecured: string;
}

interface GrantOpportunity {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  status: 'Open' | 'Applied' | 'Awarded';
}

interface Mentor {
  id: string;
  name: string;
  expertise: string;
  availability: string;
  rating: number;
}

interface Workshop {
  id: string;
  title: string;
  date: string;
  speaker: string;
  status: 'Registered' | 'Available';
}

interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: string;
  status: 'Available' | 'Reserved';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Navigation & Role State
  activeTab = signal<string>('dashboard');
  userRole = signal<'student' | 'alumni' | 'mentor' | 'evaluator' | 'manager' | 'admin'>('student');

  user = signal({
    name: 'Terwase Michael Aondofa',
    email: 'terwase.michael@alabatt.edu.ng',
    roleLabel: 'Student Entrepreneur (BSU)',
    department: 'Computer Science & Entrepreneurship',
    incubatorId: 'ALABATT-INC-2026-449',
    avatar: 'assets/aistudio/logo11_017061ca.png'
  });

  // Notifications
  notification = signal<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  showNotification(message: string, type: 'success' | 'info' | 'error' = 'success') {
    this.notification.set({ message, type });
    setTimeout(() => {
      if (this.notification()?.message === message) {
        this.notification.set(null);
      }
    }, 4000);
  }

  // 1. Business Ideas State
  ideas = signal<BusinessIdea[]>([
    {
      id: 'IDEA-001',
      title: 'AgroChain: Smart Supply Chain for Benue Farmers',
      problem: 'Post-harvest losses among smallholder farmers in Benue State due to lack of direct market linkage.',
      solution: 'A mobile and USSD platform connecting farmers directly with urban aggregators and buyers with cold storage logistics.',
      market: 'Agricultural Sector in North-Central Nigeria',
      status: 'Approved',
      score: 88,
      submittedDate: '12 Sep 2026'
    },
    {
      id: 'IDEA-002',
      title: 'CampusRide: Electric Shuttle & Ride-Sharing for Universities',
      problem: 'High transportation costs and carbon emissions within large university campuses.',
      solution: 'Solar-powered electric tricycles operating on optimized campus routes with a student ride-hailing app.',
      market: 'Tertiary Institution Transportation',
      status: 'Under Review',
      score: 76,
      submittedDate: '02 Oct 2026'
    }
  ]);

  newIdeaTitle = signal('');
  newIdeaProblem = signal('');
  newIdeaSolution = signal('');
  newIdeaMarket = signal('');
  isSubmittingIdea = signal(false);

  submitNewIdea() {
    const title = this.newIdeaTitle().trim();
    const problem = this.newIdeaProblem().trim();
    const solution = this.newIdeaSolution().trim();
    if (!title || !problem || !solution) {
      this.showNotification('Please fill in all required idea fields.', 'error');
      return;
    }
    const newIdea: BusinessIdea = {
      id: `IDEA-00${this.ideas().length + 1}`,
      title,
      problem,
      solution,
      market: this.newIdeaMarket().trim() || 'General Market',
      status: 'Submitted',
      submittedDate: new Date().toLocaleDateString()
    };
    this.ideas.update(list => [newIdea, ...list]);
    this.newIdeaTitle.set('');
    this.newIdeaProblem.set('');
    this.newIdeaSolution.set('');
    this.newIdeaMarket.set('');
    this.isSubmittingIdea.set(false);
    this.showNotification('Business idea submitted successfully to ALABATT-CES evaluation committee!', 'success');
  }

  // 2. Ventures State
  ventures = signal<Venture[]>([
    { id: 'VNT-101', name: 'AgroChain Technologies', founder: 'Terwase Michael', cohort: 'Cohort 2026-A', status: 'Incubating', milestonesCompleted: 4, totalMilestones: 6, fundingSecured: '₦1,500,000' },
    { id: 'VNT-102', name: 'EdTech Labs Makurdi', founder: 'Sarah Kator', cohort: 'Cohort 2025-B', status: 'Graduated', milestonesCompleted: 6, totalMilestones: 6, fundingSecured: '₦3,000,000' },
    { id: 'VNT-103', name: 'Solaris Agro-Dryers', founder: 'Ahmad Bello', cohort: 'Cohort 2026-A', status: 'Incubating', milestonesCompleted: 3, totalMilestones: 5, fundingSecured: '₦800,000' }
  ]);

  // 3. AI Business Plan Assistant State
  aiPlanTopic = signal('');
  aiPlanOutput = signal('');
  isGeneratingPlan = signal(false);

  async generateAiBusinessPlan() {
    const topic = this.aiPlanTopic().trim();
    if (!topic) {
      this.showNotification('Please enter your venture concept or title.', 'error');
      return;
    }
    this.isGeneratingPlan.set(true);
    try {
      const res = await fetch('/api/ai-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a comprehensive venture business plan for startup: "${topic}". Include Executive Summary, Problem & Solution, Target Market, Revenue Model, Operational Plan, and Financial Projections.`,
          context: 'ALABATT-CES Centre for Entrepreneurship Studies Business Plan Generator'
        })
      });
      const data = await res.json();
      this.aiPlanOutput.set(data.answer || 'No plan generated.');
      this.showNotification('AI Business Plan generated successfully!', 'success');
    } catch {
      this.showNotification('Failed to generate AI plan. Please check server connection.', 'error');
    } finally {
      this.isGeneratingPlan.set(false);
    }
  }

  // 4. Funding Grants State
  grants = signal<GrantOpportunity[]>([
    { id: 'GRT-01', title: 'Benue State Innovation Seed Grant', provider: 'BSU & Bank of Industry', amount: '₦2,500,000', deadline: '30 Nov 2026', status: 'Open' },
    { id: 'GRT-02', title: 'ALABATT Angel Investor Catalyst Fund', provider: 'ALABATT Venture Partners', amount: '₦5,000,000', deadline: '15 Dec 2026', status: 'Applied' },
    { id: 'GRT-03', title: 'Green Energy & AgTech Subsidy', provider: 'Federal Ministry of Innovation', amount: '₦1,800,000', deadline: '10 Nov 2026', status: 'Open' }
  ]);

  applyGrant(id: string) {
    this.grants.update(list =>
      list.map(g => g.id === id ? { ...g, status: 'Applied' } : g)
    );
    this.showNotification('Funding grant application submitted successfully!', 'success');
  }

  // 5. Mentorship State
  mentors = signal<Mentor[]>([
    { id: 'MNT-1', name: 'Dr. John Okibe', expertise: 'Agribusiness & Venture Capital', availability: 'Tue / Thu (10am - 2pm)', rating: 4.9 },
    { id: 'MNT-2', name: 'Engr. Mrs. Beatrice Tser', expertise: 'Software Architecture & Product Scaling', availability: 'Mon / Wed (2pm - 5pm)', rating: 4.8 },
    { id: 'MNT-3', name: 'Mr. David Abenga', expertise: 'Financial Modeling & Tax Compliance', availability: 'Fri (9am - 12pm)', rating: 4.7 }
  ]);

  bookMentor(name: string) {
    this.showNotification(`Mentorship session successfully booked with ${name}! Confirmation email sent.`, 'success');
  }

  // 6. Workshops State
  workshops = signal<Workshop[]>([
    { id: 'WKS-1', title: 'Venture Capital Pitching Masterclass', date: '29 Oct 2026 - 10:00 AM', speaker: 'Mrs. Linda Mba (VC Partner)', status: 'Available' },
    { id: 'WKS-2', title: 'Legal Structuring & IP Protection for Startups', date: '05 Nov 2026 - 2:00 PM', speaker: 'Barr. Terfa Wende', status: 'Registered' },
    { id: 'WKS-3', title: 'AI & Machine Learning in Modern Agribusiness', date: '12 Nov 2026 - 11:00 AM', speaker: 'Prof. J. I. Agba', status: 'Available' }
  ]);

  registerWorkshop(id: string) {
    this.workshops.update(list =>
      list.map(w => w.id === id ? { ...w, status: 'Registered' } : w)
    );
    this.showNotification('Successfully registered for the workshop!', 'success');
  }

  // 7. Resource Booking State
  resources = signal<Resource[]>([
    { id: 'RES-1', name: 'ALABATT Co-Working Workstation Alpha', type: 'Workspace Desk & Fiber Internet', capacity: '1 Desk', status: 'Available' },
    { id: 'RES-2', name: 'CES Executive Incubation Boardroom', type: 'Meeting & Pitch Room', capacity: '15 Persons', status: 'Reserved' },
    { id: 'RES-3', name: 'Hardware Prototyping 3D Printing Lab', type: 'IoT & 3D Printers', capacity: '4 Units', status: 'Available' }
  ]);

  reserveResource(id: string) {
    this.resources.update(list =>
      list.map(r => r.id === id ? { ...r, status: 'Reserved' } : r)
    );
    this.showNotification('Resource successfully reserved!', 'success');
  }

  // Statistics computed
  totalVenturesCount = computed(() => this.ventures().length);
  activeIdeasCount = computed(() => this.ideas().length);
  totalFundingSecured = computed(() => '₦7,300,000');
}
