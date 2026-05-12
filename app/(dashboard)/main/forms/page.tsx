"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  FileText,
  Plus,
  Settings,
  Users,
  Eye,
  Trash2,
  Check,
  ChevronRight,
  Layout,
  Type,
  Phone as PhoneIcon,
  Mail,
  User,
  MapPin,
  MessageSquare,
  Lock,
} from "lucide-react";
import "../main.css";

type FormField = {
  id: string;
  label: string;
  type: string;
  icon: any;
};

const AVAILABLE_FIELDS: FormField[] = [
  { id: "name", label: "Full Name", type: "text", icon: User },
  { id: "phone", label: "Phone Number", type: "tel", icon: PhoneIcon },
  { id: "email", label: "Email Address", type: "email", icon: Mail },
  { id: "occupation", label: "Occupation", type: "text", icon: Layout },
  { id: "gender", label: "Gender", type: "select", icon: Users },
  {
    id: "prayer",
    label: "Message / Request",
    type: "textarea",
    icon: MessageSquare,
  },
  { id: "notes", label: "General Notes", type: "textarea", icon: Type },
  { id: "address", label: "Home Address", type: "text", icon: MapPin },
];

export default function FormsPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  const [forms, setForms] = useState([
    {
      id: "1",
      title: "Service Newcomers",
      type: "Outreach",
      fields: ["name", "phone", "email", "prayer"],
      access: "Everyone",
      status: "Active",
      responses: 45,
    },
    {
      id: "2",
      title: "Staff Training Registration",
      type: "Trainings",
      fields: ["name", "phone", "occupation"],
      access: "Workers only",
      status: "Active",
      responses: 12,
    },
  ]);

  const [newForm, setNewForm] = useState({
    title: "",
    type: "Outreach",
    fields: [] as string[],
    access: "Everyone",
  });

  const formTypes = [
    "Outreach",
    "Programs",
    "Conferences",
    "Events",
    "Trainings",
  ];
  const accessRoles = [
    "Everyone",
    "Workers only",
    "Volunteers only",
    "Admins only",
  ];

  const toggleField = (fieldId: string) => {
    setNewForm((prev) => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter((id) => id !== fieldId)
        : [...prev.fields, fieldId],
    }));
  };

  const handleEditClick = (form: any) => {
    setEditingFormId(form.id);
    setNewForm({
      title: form.title,
      type: form.type,
      fields: form.fields,
      access: form.access,
    });
    setWizardStep(1);
    setIsBuilderOpen(true);
  };

  const handleCreateForm = () => {
    if (editingFormId) {
      setForms((prev) =>
        prev.map((f) => (f.id === editingFormId ? { ...f, ...newForm } : f)),
      );
    } else {
      const form = {
        id: Math.random().toString(),
        ...newForm,
        status: "Active",
        responses: 0,
      };
      setForms([form, ...forms]);
    }

    setIsBuilderOpen(false);
    setWizardStep(1);
    setEditingFormId(null);
    setNewForm({
      title: "",
      type: "Outreach",
      fields: [],
      access: "Everyone",
    });
  };

  const closeModal = () => {
    setIsBuilderOpen(false);
    setEditingFormId(null);
    setNewForm({
      title: "",
      type: "Outreach",
      fields: [],
      access: "Everyone",
    });
  };

  return (
    <div className="hq-dashboard-premium">
      <div className="page-header flex-between">
        <div className="header-main">
          <div className="header-badge">Management Tools</div>
          <h1>Custom Forms</h1>
          <p>
            Create and deploy data collection forms for various organization
            activities.
          </p>
        </div>
        <Button
          className="btn-premium"
          onClick={() => {
            setEditingFormId(null);
            setIsBuilderOpen(true);
          }}
        >
          <Plus size={18} /> <span>Create New Form</span>
        </Button>
      </div>

      <div className="forms-display-grid">
        {forms.map((form) => (
          <Card key={form.id} className="form-manage-card">
            <div className="form-card-header">
              <div className="form-icon-container">
                <div className="form-icon-box">
                  <FileText size={24} />
                </div>
                <div
                  className={`form-status-badge ${form.status.toLowerCase()}`}
                >
                  <span className="dot" /> {form.status}
                </div>
              </div>
              <div className="form-title-info">
                <h4>{form.title}</h4>
                <span className="form-type-badge">{form.type}</span>
              </div>
            </div>

            <div className="form-card-body">
              <div className="form-stat-row">
                <div className="stat-icon-wrapper">
                  <Lock size={16} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Access Control</span>
                  <span className="stat-value">{form.access}</span>
                </div>
              </div>

              <div className="form-stat-row">
                <div className="stat-icon-wrapper">
                  <Layout size={16} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Form Content</span>
                  <span className="stat-value">
                    {form.fields.length} Fields Selected
                  </span>
                </div>
              </div>

              <div className="form-stat-row">
                <div className="stat-icon-wrapper">
                  <Users size={16} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Response Metrics</span>
                  <span className="stat-value">
                    {form.responses} Submissions
                  </span>
                </div>
              </div>
            </div>

            <div className="form-card-footer">
              <div className="form-footer-actions">
                <button className="btn-card-action">
                  <Eye size={16} /> View
                </button>
                <button
                  className="btn-card-action"
                  onClick={() => handleEditClick(form)}
                >
                  <Settings size={16} /> Edit
                </button>
              </div>
              <button className="btn-card-delete">
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Form Builder Wizard Modal */}
      {isBuilderOpen && (
        <div className="modal-overlay">
          <Card className="modal-card-premium form-builder-modal">
            <div className="modal-header">
              <h2>
                {editingFormId ? "Edit Form: " : "Create Form: "}
                {wizardStep === 1
                  ? "Step 1: Identity"
                  : wizardStep === 2
                    ? "Step 2: Fields"
                    : "Step 3: Access"}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="wizard-container">
              <div className="wizard-steps-indicator">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`wizard-dot ${wizardStep >= i ? "active" : ""}`}
                  />
                ))}
              </div>

              {wizardStep === 1 && (
                <div className="wizard-step-content fade-in">
                  <p className="wizard-hint">
                    Categorize your form and give it a clear title.
                  </p>
                  <div className="form-stack">
                    <Input
                      label="Form Title"
                      placeholder="e.g. Youth Camp 2026 Registration"
                      value={newForm.title}
                      onChange={(e) =>
                        setNewForm({ ...newForm, title: e.target.value })
                      }
                    />
                    <div className="form-group-premium">
                      <label>Form Type</label>
                      <select
                        className="premium-select"
                        value={newForm.type}
                        onChange={(e) =>
                          setNewForm({ ...newForm, type: e.target.value })
                        }
                      >
                        {formTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="wizard-actions">
                    <Button
                      fullWidth
                      disabled={!newForm.title}
                      onClick={() => setWizardStep(2)}
                    >
                      Next: Choose Fields <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="wizard-step-content fade-in">
                  <p className="wizard-hint">
                    Select the information you want to collect.
                  </p>
                  <div className="fields-selection-grid">
                    {AVAILABLE_FIELDS.map((field) => (
                      <div
                        key={field.id}
                        className={`field-option-card ${newForm.fields.includes(field.id) ? "active" : ""}`}
                        onClick={() => toggleField(field.id)}
                      >
                        <field.icon size={20} />
                        <span>{field.label}</span>
                        {newForm.fields.includes(field.id) && (
                          <Check size={16} className="check" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="wizard-actions split">
                    <Button variant="ghost" onClick={() => setWizardStep(1)}>
                      Back
                    </Button>
                    <Button
                      disabled={newForm.fields.length === 0}
                      onClick={() => setWizardStep(3)}
                    >
                      Next: Set Access <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="wizard-step-content fade-in">
                  <p className="wizard-hint">
                    Who should see this form on their dashboard?
                  </p>
                  <div className="access-selection-list">
                    {accessRoles.map((role) => (
                      <div
                        key={role}
                        className={`access-option-card ${newForm.access === role ? "active" : ""}`}
                        onClick={() => setNewForm({ ...newForm, access: role })}
                      >
                        <Users size={18} />
                        <span>{role}</span>
                        {newForm.access === role && <Check size={18} />}
                      </div>
                    ))}
                  </div>
                  <div className="wizard-actions split">
                    <Button variant="ghost" onClick={() => setWizardStep(2)}>
                      Back
                    </Button>
                    <Button className="btn-premium" onClick={handleCreateForm}>
                      Publish Form <Check size={18} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
