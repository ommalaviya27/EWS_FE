import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project} from '../../../modules/admin/project/models/project.model';
import { ProjectStatus, PROJECT_STATUS_LABELS } from '../../../modules/admin/project/models/project.model';

@Component({
  selector: 'app-project-list',
  imports: [CommonModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList {
  @Input() projects: Project[] = [];
  @Input() actionLabel: string = 'View Tasks';
  @Output() projectSelected = new EventEmitter<Project>();

  readonly statusLabels = PROJECT_STATUS_LABELS;

  tooltip = { visible: false, text: '', x: 0, y: 0 };

  onProjectClick(project: Project): void {
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

  showTooltip(event: MouseEvent, text: string): void {
    this.tooltip = { visible: true, text, x: event.clientX, y: event.clientY };
  }

  moveTooltip(event: MouseEvent): void {
    this.tooltip.x = event.clientX;
    this.tooltip.y = event.clientY;
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }
}