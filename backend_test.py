import requests
import sys
from datetime import datetime, timedelta
import json

class WGCheckInAPITester:
    def __init__(self, base_url="https://wg-checkin.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_stay_id = None
        self.created_manual_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Response ID: {response_data['id']}")
                    elif isinstance(response_data, list):
                        print(f"   Response count: {len(response_data)}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response text: {response.text[:200]}")

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )
        return success

    def test_list_stays_empty(self):
        """Test listing stays (should work even if empty)"""
        success, response = self.run_test(
            "List Stays (Initial)",
            "GET",
            "api/stays",
            200
        )
        return success

    def test_create_stay(self):
        """Test creating a new stay"""
        today = datetime.now()
        tomorrow = today + timedelta(days=1)
        
        stay_data = {
            "room": "A",
            "occupant_name": "Test User",
            "start_date": today.isoformat(),
            "end_date": tomorrow.isoformat(),
            "notes": "Test stay for API testing",
            "checklist_in": [
                {"text": "Schlüssel übergeben", "done": False},
                {"text": "Hausregeln erklären", "done": False}
            ],
            "checklist_out": [
                {"text": "Zimmer kontrollieren", "done": False},
                {"text": "Schlüssel zurückgeben", "done": False}
            ]
        }
        
        success, response = self.run_test(
            "Create Stay",
            "POST",
            "api/stays",
            200,
            data=stay_data
        )
        
        if success and 'id' in response:
            self.created_stay_id = response['id']
            print(f"   Created stay ID: {self.created_stay_id}")
        
        return success

    def test_get_stay(self):
        """Test getting a specific stay"""
        if not self.created_stay_id:
            print("❌ Skipping get stay test - no stay ID available")
            return False
            
        success, response = self.run_test(
            "Get Stay by ID",
            "GET",
            f"api/stays/{self.created_stay_id}",
            200
        )
        return success

    def test_update_stay(self):
        """Test updating a stay"""
        if not self.created_stay_id:
            print("❌ Skipping update stay test - no stay ID available")
            return False
            
        update_data = {
            "notes": "Updated test notes",
            "checklist_in": [
                {"text": "Schlüssel übergeben", "done": True},
                {"text": "Hausregeln erklären", "done": False}
            ]
        }
        
        success, response = self.run_test(
            "Update Stay",
            "PUT",
            f"api/stays/{self.created_stay_id}",
            200,
            data=update_data
        )
        return success

    def test_list_manuals_empty(self):
        """Test listing manuals (should work even if empty)"""
        success, response = self.run_test(
            "List Manuals (Initial)",
            "GET",
            "api/manuals",
            200
        )
        return success

    def test_create_manual(self):
        """Test creating a new manual"""
        manual_data = {
            "title": "Test Gerät",
            "description": "Testbeschreibung für ein Gerät",
            "steps": "1. Gerät einschalten\n2. Einstellungen prüfen\n3. Gerät verwenden",
            "image_url": "https://images.unsplash.com/photo-1607273177147-e7304c4d5d6c?crop=entropy&cs=srgb&fm=jpg&q=85"
        }
        
        success, response = self.run_test(
            "Create Manual",
            "POST",
            "api/manuals",
            200,
            data=manual_data
        )
        
        if success and 'id' in response:
            self.created_manual_id = response['id']
            print(f"   Created manual ID: {self.created_manual_id}")
        
        return success

    def test_get_manual(self):
        """Test getting a specific manual"""
        if not self.created_manual_id:
            print("❌ Skipping get manual test - no manual ID available")
            return False
            
        success, response = self.run_test(
            "Get Manual by ID",
            "GET",
            f"api/manuals/{self.created_manual_id}",
            200
        )
        return success

    def test_update_manual(self):
        """Test updating a manual"""
        if not self.created_manual_id:
            print("❌ Skipping update manual test - no manual ID available")
            return False
            
        update_data = {
            "description": "Updated test description",
            "steps": "1. Updated step one\n2. Updated step two"
        }
        
        success, response = self.run_test(
            "Update Manual",
            "PUT",
            f"api/manuals/{self.created_manual_id}",
            200,
            data=update_data
        )
        return success

    def test_list_stays_with_data(self):
        """Test listing stays after creating data"""
        success, response = self.run_test(
            "List Stays (With Data)",
            "GET",
            "api/stays",
            200
        )
        return success

    def test_list_manuals_with_data(self):
        """Test listing manuals after creating data"""
        success, response = self.run_test(
            "List Manuals (With Data)",
            "GET",
            "api/manuals",
            200
        )
        return success

    def test_delete_stay(self):
        """Test deleting a stay"""
        if not self.created_stay_id:
            print("❌ Skipping delete stay test - no stay ID available")
            return False
            
        success, response = self.run_test(
            "Delete Stay",
            "DELETE",
            f"api/stays/{self.created_stay_id}",
            200
        )
        return success

    def test_delete_manual(self):
        """Test deleting a manual"""
        if not self.created_manual_id:
            print("❌ Skipping delete manual test - no manual ID available")
            return False
            
        success, response = self.run_test(
            "Delete Manual",
            "DELETE",
            f"api/manuals/{self.created_manual_id}",
            200
        )
        return success

def main():
    print("🚀 Starting WG Check-in API Tests")
    print("=" * 50)
    
    tester = WGCheckInAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_list_stays_empty,
        tester.test_list_manuals_empty,
        tester.test_create_stay,
        tester.test_get_stay,
        tester.test_update_stay,
        tester.test_create_manual,
        tester.test_get_manual,
        tester.test_update_manual,
        tester.test_list_stays_with_data,
        tester.test_list_manuals_with_data,
        tester.test_delete_stay,
        tester.test_delete_manual,
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())