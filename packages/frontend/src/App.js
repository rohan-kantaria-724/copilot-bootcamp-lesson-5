import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import theme from './theme/theme';
import ItemDetails from './components/ItemDetails';
import ItemService from './utils/ItemService';
import './App.css';

// Logger utility for debugging
const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${new Date().toISOString()} - App: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()} - App: ${message}`, error ? error.stack || error : '');
  },
  debug: (message, data = null) => {
    console.log(`[DEBUG] ${new Date().toISOString()} - App: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  warn: (message, data = null) => {
    console.warn(`[WARN] ${new Date().toISOString()} - App: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

function App() {
  logger.info('App component initializing');
  const [data, setData] = useState([]);
  const [detailedItems, setDetailedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemService] = useState(new ItemService());

  useEffect(() => {
    logger.info('App useEffect triggered - fetching initial data');
    fetchData();
    fetchDetailedItems();
  }, []);

  const fetchData = async () => {
    logger.info('fetchData: Starting to fetch basic items');
    try {
      setLoading(true);
      logger.debug('fetchData: Making API request to /api/items');
      const response = await fetch('/api/items');
      if (!response.ok) {
        logger.error('fetchData: API request failed', { status: response.status, statusText: response.statusText });
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      logger.info('fetchData: Successfully fetched items', { itemCount: result.length });
      setData(result);
      setError(null);
    } catch (err) {
      logger.error('fetchData: Error occurred', err);
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      logger.debug('fetchData: Loading state set to false');
    }
  };

  const fetchDetailedItems = async () => {
    logger.info('fetchDetailedItems: Starting to fetch detailed items');
    try {
      logger.debug('fetchDetailedItems: Making API request to /api/items/details');
      const response = await fetch('/api/items/details');
      if (!response.ok) {
        logger.error('fetchDetailedItems: API request failed', { status: response.status, statusText: response.statusText });
        throw new Error('Failed to fetch detailed items');
      }
      const result = await response.json();
      logger.info('fetchDetailedItems: Successfully fetched detailed items', { itemCount: result.length });
      setDetailedItems(result);
    } catch (err) {
      logger.error('fetchDetailedItems: Error occurred', err);
      console.error('Error fetching detailed items:', err);
    }
  };

  const handleItemDetailsOpen = (
    item,
    mode,
    permissions,
    validationLevel,
    notificationSettings,
    auditEnabled,
    backupEnabled,
    showAdvanced,
    enableNotifications,
    autoSave,
    readOnly,
    allowEdit,
    allowDelete,
    showHistory,
    customFields,
    templateId
  ) => {
    logger.info('handleItemDetailsOpen: Function called', {
      itemId: item?.id,
      mode,
      parameterCount: arguments.length
    });
    setSelectedItem(item);
    setItemDetailsOpen(true);
    logger.debug('handleItemDetailsOpen: Item details dialog opened successfully');
  };

  const handleItemDetailsSave = async (itemData) => {
    logger.info('handleItemDetailsSave: Function called', { 
      itemName: itemData?.name,
      itemCategory: itemData?.category 
    });
    try {
      logger.debug('handleItemDetailsSave: Calling itemService.createItemWithDetails with object parameters');
      const result = await itemService.createItemWithDetails(
        {
          name: itemData.name,
          description: itemData.description,
          category: itemData.category,
          priority: itemData.priority,
          tags: itemData.tags,
          status: itemData.status,
          dueDate: itemData.dueDate,
          assignee: itemData.assignee,
          createdBy: 'current_user',
          customFields: itemData.customFields,
          metadata: itemData.metadata,
          attachments: itemData.attachments,
          dependencies: itemData.dependencies,
          estimatedHours: itemData.estimatedHours,
          actualHours: itemData.actualHours,
          budget: itemData.budget,
          currency: 'USD',
          location: itemData.location,
          externalReferences: itemData.externalReferences
        },
        {
          permissions: itemData.permissions,
          validationLevel: 'standard',
          notificationSettings: itemData.notificationSettings,
          auditEnabled: true,
          backupEnabled: true,
          versionControl: true
        }
      );
      logger.info('handleItemDetailsSave: Item saved successfully', { itemId: result?.id });
      setDetailedItems([...detailedItems, result]);
      setItemDetailsOpen(false);
      setSelectedItem(null);
    } catch (error) {
      logger.error('handleItemDetailsSave: Error occurred while saving item', error);
      setError('Failed to save item details');
    }
  };

  const handleSubmit = async (e) => {
    logger.info('handleSubmit: Form submission started');
    e.preventDefault();
    if (!newItem.trim()) {
      logger.warn('handleSubmit: Attempted to submit empty item name');
      return;
    }

    try {
      logger.debug('handleSubmit: Making API request to create new item', { itemName: newItem });
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem }),
      });

      if (!response.ok) {
        logger.error('handleSubmit: API request failed', { status: response.status, statusText: response.statusText });
        throw new Error('Failed to add item');
      }

      const result = await response.json();
      logger.info('handleSubmit: Item created successfully', { itemId: result.id, itemName: result.name });
      setData([...data, result]);
      setNewItem('');
    } catch (err) {
      logger.error('handleSubmit: Error occurred', err);
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setData(data.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  const deleteDetailedItem = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}/details`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove item from both local states
        setDetailedItems(detailedItems.filter(item => item.id !== itemId));
        setData(data.filter(item => item.id !== itemId));
        logger.info('deleteDetailedItem: Item deleted successfully', { itemId });
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      logger.error('deleteDetailedItem: Delete failed', error);
      console.error('Delete failed:', error);
      setError('Delete failed: ' + error.message);
    }
  };

  const updateDetailedItem = async (itemData) => {
    try {
      // Basic validation
      if (!itemData || !itemData.name || itemData.name.trim() === '') {
        throw new Error('Invalid item data: name is required');
      }
      
      const response = await fetch(`/api/items/${itemData.id}/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update item in both local states
        setDetailedItems(prevItems => 
          prevItems.map(item => 
            item.id === itemData.id ? { ...item, ...result } : item
          )
        );
        setData(prevItems => 
          prevItems.map(item => 
            item.id === itemData.id ? { ...item, ...result } : item
          )
        );
        logger.info('updateDetailedItem: Item updated successfully', { itemId: itemData.id });
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      logger.error('updateDetailedItem: Update failed', error);
      setError('Update failed: ' + error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h1" component="h1" color="white" sx={{ 
            backgroundColor: 'primary.main',
            p: 2,
            borderRadius: 1,
            mb: 0
          }}>
            Hello World
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Connected to in-memory database
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Add New Item
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter item name"
                size="medium"
              />
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ minWidth: 120 }}
              >
                Add Item
              </Button>
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Items from Database
            </Typography>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Loading data...
                </Typography>
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {!loading && !error && (
              <>
                {data.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="items table">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((item) => (
                          <TableRow 
                            key={item.id} 
                            sx={{ 
                              '&:hover': { backgroundColor: 'grey.50' },
                              '&:last-child td, &:last-child th': { border: 0 }
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {item.id}
                            </TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              {new Date(item.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() => handleDelete(item.id)}
                                color="error"
                                aria-label={`Delete ${item.name}`}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'error.light',
                                    color: 'white'
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    No items found. Add some!
                  </Typography>
                )}
              </>
            )}
          </Paper>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h2" component="h2">
              Item Details Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleItemDetailsOpen(
                null, // item
                'create', // mode
                ['read', 'write'], // permissions
                'standard', // validationLevel
                { email: true, sms: false }, // notificationSettings
                true, // auditEnabled
                true, // backupEnabled
                false, // showAdvanced
                true, // enableNotifications
                false, // autoSave
                false, // readOnly
                true, // allowEdit
                true, // allowDelete
                false, // showHistory
                {}, // customFields
                null // templateId
              )}
            >
              Add Details
            </Button>
          </Box>

          {detailedItems.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }} aria-label="detailed items table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedItems.map((item) => (
                    <TableRow 
                      key={item.id}
                      sx={{ 
                        '&:hover': { backgroundColor: 'grey.50' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {item.id}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.priority}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => {
                            handleItemDetailsOpen(
                              item, 'edit', ['read', 'write'], 'standard',
                              { email: true }, true, true, true, true, false,
                              false, true, true, true, {}, null
                            );
                          }}
                          color="primary"
                          aria-label={`Edit ${item.name}`}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            deleteDetailedItem(item.id);
                          }}
                          color="error"
                          aria-label={`Delete ${item.name}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              No detailed items found. Create some!
            </Typography>
          )}
        </Paper>

        <ItemDetails
          dialogConfig={{
            open: itemDetailsOpen,
            onClose: () => setItemDetailsOpen(false)
          }}
          itemData={{
            itemId: selectedItem?.id,
            itemName: selectedItem?.name,
            itemDescription: selectedItem?.description,
            itemCategory: selectedItem?.category,
            itemPriority: selectedItem?.priority,
            itemTags: selectedItem?.tags ? JSON.parse(selectedItem.tags) : [],
            itemStatus: selectedItem?.status,
            itemDueDate: selectedItem?.due_date,
            itemAssignee: selectedItem?.assignee,
            itemCreatedBy: selectedItem?.created_by,
            itemCreatedAt: selectedItem?.created_at,
            itemUpdatedAt: selectedItem?.updated_at
          }}
          handlers={{
            onSave: handleItemDetailsSave,
            onDelete: async (id) => {
              await deleteDetailedItem(id);
              setItemDetailsOpen(false);
            },
            onUpdate: async (data) => {
              await updateDetailedItem(data);
              setItemDetailsOpen(false);
            },
            onStatusChange: (status) => {
              console.log('Status changed:', status);
            },
            onPriorityChange: (priority) => {
              console.log('Priority changed:', priority);
            },
            onCategoryChange: (category) => {
              console.log('Category changed:', category);
            },
            onTagsChange: (tags) => {
              console.log('Tags changed:', tags);
            },
            onAssigneeChange: (assignee) => {
              console.log('Assignee changed:', assignee);
            },
            onDueDateChange: (date) => {
              console.log('Due date changed:', date);
            },
            onDescriptionChange: (desc) => {
              console.log('Description changed:', desc);
            },
            onNameChange: (name) => {
              console.log('Name changed:', name);
            }
          }}
          options={{
            showAdvanced: true,
            enableNotifications: true,
            autoSave: false,
            readOnly: false,
            allowEdit: true,
            allowDelete: true,
            showHistory: false,
            historyData: [],
            validationRules: {},
            customFields: {},
            permissions: { canRead: true, canWrite: true }
          }}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;