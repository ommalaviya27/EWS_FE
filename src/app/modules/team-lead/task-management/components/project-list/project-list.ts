import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectOption } from '../../models/task-management.model';
import { ProjectStatus, PROJECT_STATUS_LABELS } from '../../../../admin/project/models/project.model';

export interface ProjectCard extends ProjectOption {
  description: string;
  projectStatus: ProjectStatus;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-project-list',
  imports: [CommonModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList {
  @Input() projects: ProjectCard[] = [];
  @Output() projectSelected = new EventEmitter<ProjectCard>();

  readonly statusLabels = PROJECT_STATUS_LABELS;

  onProjectClick(project: ProjectCard): void {
    this.projectSelected.emit(project);
  }

  getStatusLabel(status: ProjectStatus): string {
    return this.statusLabels[status] ?? '—';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
