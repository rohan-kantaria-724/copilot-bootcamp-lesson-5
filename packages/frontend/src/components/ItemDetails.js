import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';

// Logger utility for debugging
const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${new Date().toISOString()} - ItemDetails: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ItemDetails: ${message}`, error ? error.stack || error : '');
  },
  debug: (message, data = null) => {
    console.log(`[DEBUG] ${new Date().toISOString()} - ItemDetails: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  warn: (message, data = null) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ItemDetails: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

/**
 * ItemDetails component for managing detailed item information
 * Refactored to use configuration objects instead of long parameter lists
 */
function ItemDetails({ 
  dialogConfig,
  itemData,
  handlers,
  options = {}
}) {
  // Destructure dialog configuration
  const {
    open = false,
    onClose = () => {}
  } = dialogConfig || {};

  // Destructure item data
  const {
    itemId,
    itemName = '',
    itemDescription = '',
    itemCategory = '',
    itemPriority = 'medium',
    itemTags = [],
    itemStatus = 'active',
    itemDueDate = '',
    itemAssignee = '',
    itemCreatedBy = '',
    itemCreatedAt = '',
    itemUpdatedAt = ''
  } = itemData || {};

  // Destructure handlers
  const {
    onSave = () => {},
    onDelete = () => {},
    onUpdate = () => {},
    onStatusChange = () => {},
    onPriorityChange = () => {},
    onCategoryChange = () => {},
    onTagsChange = () => {},
    onAssigneeChange = () => {},
    onDueDateChange = () => {},
    onDescriptionChange = () => {},
    onNameChange = () => {},
    onNotificationChange = () => {},
    onAutoSaveChange = () => {}
  } = handlers || {};

  // Destructure options
  const {
    showAdvanced = false,
    enableNotifications = false,
    autoSave = false,
    readOnly = false,
    allowEdit = true,
    allowDelete = true,
    showHistory = false,
    historyData = [],
    validationRules = {},
    customFields = {},
    permissions = { canRead: true, canWrite: true }
  } = options;

  logger.info('ItemDetails component initialized', {
    itemId, 
    itemName, 
    itemCategory,
    open,
    readOnly,
    allowEdit,
    allowDelete,
    configObjectCount: Object.keys({ dialogConfig, itemData, handlers, options }).length
  });
  
  const [localName, setLocalName] = useState(itemName || '');
  const [localDescription, setLocalDescription] = useState(itemDescription || '');
  const [localCategory, setLocalCategory] = useState(itemCategory || '');
  const [localPriority, setLocalPriority] = useState(itemPriority || 'medium');
  const [localTags, setLocalTags] = useState(itemTags || []);
  const [localStatus, setLocalStatus] = useState(itemStatus || 'active');
  const [localDueDate, setLocalDueDate] = useState(itemDueDate || '');
  const [localAssignee, setLocalAssignee] = useState(itemAssignee || '');
  const [localEnableNotifications, setLocalEnableNotifications] = useState(enableNotifications || false);
  const [localAutoSave, setLocalAutoSave] = useState(autoSave || false);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  logger.debug('ItemDetails component state initialized', {
    localName,
    localCategory,
    localPriority,
    localStatus
  });

  // Effect to handle item data initialization
  useEffect(() => {
    logger.info('ItemDetails useEffect triggered', { itemId });
    if (itemId && itemName) {
      // Initialize form with item data when dialog opens
      setLocalName(itemName || '');
      setLocalDescription(itemDescription || '');
      setLocalCategory(itemCategory || '');
      setLocalPriority(itemPriority || 'medium');
      setLocalTags(itemTags || []);
      setLocalStatus(itemStatus || 'active');
      setLocalDueDate(itemDueDate || '');
      setLocalAssignee(itemAssignee || '');
      setIsDirty(false);
      logger.debug('ItemDetails: Form data initialized from props');
    }
  }, [itemId, itemName, itemDescription, itemCategory, itemPriority, itemTags, itemStatus, itemDueDate, itemAssignee]);

  // Function to handle saving with proper validation
  const handleSave = () => {
    logger.info('handleSave: Function called');
    
    try {
      // Validate required fields
      const newErrors = {};
      
      if (!localName || localName.trim() === '') {
        newErrors.name = 'Name is required';
      }
      
      if (localCategory && !['work', 'personal', 'urgent', 'general'].includes(localCategory)) {
        newErrors.category = 'Invalid category';
      }
      
      if (localPriority && !['low', 'medium', 'high', 'critical'].includes(localPriority)) {
        newErrors.priority = 'Invalid priority';
      }
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length > 0) {
        logger.warn('handleSave: Validation failed', { errors: newErrors });
        setIsValid(false);
        return;
      }
      
      setIsValid(true);
      logger.debug('handleSave: Validation passed, preparing item data');
      
      const updatedItem = {
        id: itemId,
        name: localName,
        description: localDescription,
        category: localCategory,
        priority: localPriority,
        tags: localTags,
        status: localStatus,
        dueDate: localDueDate,
        assignee: localAssignee
      };
      
      if (itemId) {
        // Editing existing item
        logger.info('handleSave: Calling onUpdate with updated item', { itemId });
        if (onUpdate) {
          onUpdate(updatedItem);
        }
      } else {
        // Creating new item
        logger.info('handleSave: Calling onSave with new item');
        if (onSave) {
          onSave(updatedItem);
        }
      }
      setIsDirty(false);
    } catch (error) {
      logger.error('handleSave: Error occurred during save', error);
      setErrors({ general: 'An error occurred while saving' });
    }
  };

  const handleInputChange = (field, value) => {
    logger.debug('handleInputChange: Field value changed', { field, value, previousDirty: isDirty });
    setIsDirty(true);
    
    switch (field) {
      case 'name':
        logger.debug('handleInputChange: Updating name field', { oldValue: localName, newValue: value });
        setLocalName(value);
        if (onNameChange) {
          logger.debug('handleInputChange: Calling onNameChange callback');
          onNameChange(value);
        }
        break;
      case 'description':
        logger.debug('handleInputChange: Updating description field');
        setLocalDescription(value);
        if (onDescriptionChange) {
          onDescriptionChange(value);
        }
        break;
      case 'category':
        logger.debug('handleInputChange: Updating category field', { oldValue: localCategory, newValue: value });
        setLocalCategory(value);
        if (onCategoryChange) {
          onCategoryChange(value);
        }
        break;
      case 'priority':
        logger.debug('handleInputChange: Updating priority field', { oldValue: localPriority, newValue: value });
        setLocalPriority(value);
        if (onPriorityChange) {
          onPriorityChange(value);
        }
        break;
      case 'status':
        logger.debug('handleInputChange: Updating status field', { oldValue: localStatus, newValue: value });
        setLocalStatus(value);
        if (onStatusChange) {
          onStatusChange(value);
        }
        break;
      case 'dueDate':
        logger.debug('handleInputChange: Updating dueDate field', { oldValue: localDueDate, newValue: value });
        setLocalDueDate(value);
        if (onDueDateChange) {
          onDueDateChange(value);
        }
        break;
      case 'assignee':
        logger.debug('handleInputChange: Updating assignee field', { oldValue: localAssignee, newValue: value });
        setLocalAssignee(value);
        if (onAssigneeChange) {
          onAssigneeChange(value);
        }
        break;
      default:
        logger.warn('handleInputChange: Unhandled field type', { field, value });
        // No logging of unhandled cases
        break;
    }
  };

  // Function to format created date safely
  const formatCreatedDate = (date) => {
    logger.debug('formatCreatedDate: Formatting date', { date });
    try {
      if (!date) return 'Unknown';
      
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        logger.warn('formatCreatedDate: Invalid date provided', { date });
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleString();
    } catch (error) {
      logger.error('formatCreatedDate: Error occurred while formatting date', error);
      return 'Unknown';
    }
  };

  // Handler for notification toggle
  const handleNotificationToggle = (checked) => {
    logger.debug('handleNotificationToggle: Toggling notifications', { checked, previousValue: localEnableNotifications });
    setLocalEnableNotifications(checked);
    setIsDirty(true);
    if (onNotificationChange) {
      onNotificationChange(checked);
    }
  };

  // Handler for auto save toggle
  const handleAutoSaveToggle = (checked) => {
    logger.debug('handleAutoSaveToggle: Toggling auto save', { checked, previousValue: localAutoSave });
    setLocalAutoSave(checked);
    setIsDirty(true);
    if (onAutoSaveChange) {
      onAutoSaveChange(checked);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {itemId ? 'Edit Item Details' : 'New Item Details'}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={localName}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={readOnly}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={localCategory}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={readOnly}
                >
                  <MenuItem value="work">Work</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={localDescription}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={localPriority}
                  label="Priority"
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  disabled={readOnly}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={localStatus}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={readOnly}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={localDueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={readOnly}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assignee"
                value={localAssignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                disabled={readOnly}
              />
            </Grid>
            
            {showAdvanced && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Advanced Options
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localEnableNotifications}
                        onChange={(e) => {
                          handleNotificationToggle(e.target.checked);
                        }}
                      />
                    }
                    label="Enable Notifications"
                    disabled={readOnly}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localAutoSave}
                        onChange={(e) => {
                          handleAutoSaveToggle(e.target.checked);
                        }}
                      />
                    }
                    label="Auto Save"
                    disabled={readOnly}
                  />
                </Grid>
              </>
            )}
            
            {itemCreatedAt && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {/* This will cause an error because formatCreatedDate calls undefined function */}
                  Created: {formatCreatedDate(itemCreatedAt)} by {itemCreatedBy}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {allowEdit && !readOnly && (
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!isValid || !isDirty}
          >
            Save Changes
          </Button>
        )}
        {allowDelete && itemId && (
          <Button 
            onClick={() => {
              // Missing confirmation dialog - this could accidentally delete items
              onDelete(itemId);
            }} 
            color="error"
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ItemDetails;
