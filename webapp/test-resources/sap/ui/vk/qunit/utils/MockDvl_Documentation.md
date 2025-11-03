# MockDvl Documentation

## Overview

MockDvl is a mock implementation of the SAP UI5 VizKit DVL (Digital Visual Library) runtime for testing purposes. It provides a lightweight alternative to the actual DVL runtime, enabling unit tests and development scenarios where the full DVL functionality is not required or available.

## Purpose

The MockDvl utility serves several key purposes:

1. **Testing Environment**: Enables unit testing of VizKit components without requiring the full DVL runtime
2. **Development Support**: Allows development in environments where WebGL2 is not available
3. **CI/CD Integration**: Facilitates automated testing in headless environments
4. **Performance**: Provides faster test execution by eliminating heavy 3D rendering operations

## Architecture

MockDvl implements the same interface as the real DVL runtime but with simplified, mock implementations. It automatically activates when WebGL2 is not available, ensuring seamless fallback behavior.

## Key Features

- **Automatic Activation**: Detects WebGL2 availability and activates automatically when needed
- **Complete API Coverage**: Implements all major DVL API methods and properties
- **Scene Management**: Supports loading and managing multiple 3D scenes
- **Camera Operations**: Full camera manipulation including position, rotation, and projection
- **Node Hierarchy**: Scene graph traversal and node manipulation
- **Material System**: Material properties and texture management
- **Event Handling**: Scene loading, step navigation, and user interaction events
- **Mock Detection**: Provides `IsUsingMock` property to identify when mock implementation is active

## Mock Detection with IsUsingMock

The `IsUsingMock` property is a boolean flag that indicates whether the MockDvl implementation is currently being used instead of the real DVL runtime. This property is essential for conditional logic in unit tests.

### Purpose

The `IsUsingMock` property serves several important purposes:

1. **Runtime Detection**: Allows tests to detect when they're running with the mock implementation
2. **Conditional Behavior**: Enables different code paths for mock vs. real DVL scenarios
3. **Test Validation**: Helps verify that tests are actually using the mock implementation
4. **Feature Availability**: Allows checking for mock-specific limitations or behaviors

### Usage Examples

#### Basic Mock Detection

```javascript
// Check if MockDvl is active
if (mockDvl.IsUsingMock) {
    console.log("Running with MockDvl implementation");
    // Execute mock-specific logic
} else {
    console.log("Running with real DVL runtime");
    // Execute real DVL logic
}
```

#### Conditional Test Logic

```javascript
QUnit.test("DVL Feature Test", function(assert) {
    if (dvlRuntime.IsUsingMock) {
        // Test with mock data and expectations
        assert.ok(true, "Mock implementation detected - using simplified test");
    } else {
        // Test with full DVL functionality
        assert.ok(dvlRuntime.someAdvancedFeature(), "Advanced feature should work");
    }
});
```

#### Conditional Test Execution

```javascript
QUnit.test.if("DVL Feature Test", !dvlRuntime.IsUsingMock, function(assert) {
        // Test with full DVL functionality
        assert.ok(dvlRuntime.someAdvancedFeature(), "Advanced feature should work");
});
```

## Installation and Setup

### Basic Setup

```javascript
sap.ui.define([
    "sap/ui/vk/qunit/utils/MockDvl"
], function(MockDvl) {
    "use strict";

    // Initialize MockDvl with test scenes
    var mockDvl = MockDvl([
        {
            SceneId: "scene1",
            Source: "test-scene.vds",
            Nodes: [/* node definitions */],
            Camera: {/* camera definition */}
        }
    ]);
});
```

### Scene Configuration

MockDvl requires scene data to be provided during initialization. Scene data example:

```javascript
var testScenes = [{
    SceneId: "unique-scene-id",
    Source: "scene-file-url.vds",
    Nodes: [
        {
            id: "node1",
            UniqueID: "node1",
            NodeName: "Root Node",
            ChildNodes: ["child1", "child2"]
        }
    ],
    Camera: {
        id: "camera1",
        origin: [0, 0, 10],
        rotation: [0, 0, 0],
        projection: sap.ve.dvl.DVLCAMERAPROJECTION.PERSPECTIVE
    },
    Materials: [
        {
            name: "material1",
            diffuseColor: [1.0, 0.0, 0.0, 1.0],
            opacity: 1.0
        }
    ],
    Procedures: [/* procedures and steps definitions */],
    Thumbnails: [/* thumbnail data */]
}];
```

## Testing Integration

### QUnit Test Setup

```javascript
QUnit.module("VizKit Component Tests", {
    beforeEach: function() {
        // Initialize MockDvl for testing
        this.mockDvl = MockDvl([
            // Test scene data
        ]);
    },

    afterEach: function() {
        // Cleanup if needed
    }
});

QUnit.test("Scene Loading Test", function(assert) {
    var done = assert.async();

    // Test scene loading
    this.mockDvl.Core.LoadSceneByUrlAsync("test.vds");

    // Verify scene loaded
    setTimeout(function() {
        assert.ok(mockDvl.loadedScene, "Scene should be loaded");
        done();
    }, 100);
});
```

## Configuration Options

### Scene Data Structure

```javascript
{
    SceneId: "unique-identifier",
    Source: "scene-file-url",
    Nodes: [
        {
            id: "node-id",
            UniqueID: "unique-node-id",
            NodeName: "Display Name",
            ChildNodes: ["child1", "child2"],
            ParentNodes: ["parent1"],
            matrix: [/* 4x4 transformation matrix */],
            HighlightColor: [r, g, b, a],
            veid: ["external-id"]
        }
    ],
    Camera: {
        id: "camera-id",
        origin: [x, y, z],
        rotation: [yaw, pitch, roll],
        targetDirection: [x, y, z],
        upDirection: [x, y, z],
        fov: 45,
        projection: projectionType
    },
    Materials: [
        {
            name: "material-name",
            diffuseColor: [r, g, b, a],
            emissiveColor: [r, g, b, a],
            ambientColor: [r, g, b, a],
            specularColor: [r, g, b, a],
            opacity: 1.0,
            glossiness: 0.5,
            specularLevel: 0.8,
            textures: [/* texture definitions */]
        }
    ],
    Procedures: {
        portfolios: [{
				id: "portfolio-id",
				name: "Portfolio 1",
				steps: [
					{
                        id: "step-id",
                        name: "Step Name"
                    }
                    /* step definition */
				]
			}],
			procedures: [{
				id: "procedure-id",
				name: "Procedure 1",
				steps: [
					{
                        id: "step-id",
                        name: "Step Name"
                        /* step definition */
                    }
				]
			}]
    },
    Thumbnails: [
        {
            id: "step-id",
            thumbnail: "base64-image-data"
        }
    ],
    Layers: [/* layer definitions */],
    SceneDimensions: {
        min: [x, y, z],
        max: [x, y, z]
    }
}
```

## Best Practices

### 1. Scene Data Preparation

- Provide realistic test data that matches your application's requirements
- Include all necessary nodes, materials, and cameras for comprehensive testing
- Use consistent naming conventions for IDs and references

### 2. Test Organization

- Initialize MockDvl in test setup methods
- Clean up resources in teardown methods
- Use async testing patterns for scene loading operations

### 3. Error Handling

- MockDvl returns appropriate error codes and null values for invalid operations
- Test both success and failure scenarios
- Verify error handling in your components

### 4. Performance Considerations

- MockDvl is designed for testing, not production use
- Keep test scene data minimal but representative
- Use MockDvl only when necessary (WebGL2 unavailable)

## Troubleshooting

### Common Issues

1. **Scene Not Loading**
   - Verify scene data structure matches expected format
   - Check that Source URL matches the provided scene data
   - Ensure SceneId is unique and properly referenced

2. **Camera Operations Failing**
   - Confirm camera exists in the cameras Map
   - Verify camera ID is correctly passed to methods
   - Check that camera is properly activated

3. **Node Operations Not Working**
   - Ensure node IDs match between operations
   - Verify node exists in the scene's Nodes array
   - Check that node references use correct ID format

4. **Material Issues**
   - Confirm material exists in scene Materials array
   - Verify material name matches exactly
   - Check that material properties are properly defined

### Debugging Tips

- Use browser developer tools to inspect MockDvl state
- Add console logging to track method calls and parameters
- Verify test data structure matches expected format
- Check for typos in property names and IDs

## Limitations

- MockDvl does not perform actual 3D rendering
- Some advanced DVL features may have simplified implementations
- Performance characteristics differ from real DVL runtime
- Visual output is not generated (no actual rendering)

## Conclusion

MockDvl provides a robust testing foundation for SAP UI5 VizKit applications. By implementing the complete DVL API surface, it enables comprehensive unit testing while maintaining compatibility with existing code. Use MockDvl to ensure your VizKit components work correctly across different environments and deployment scenarios.
