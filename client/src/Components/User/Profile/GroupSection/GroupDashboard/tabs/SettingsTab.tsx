import {
  Card,
  CardBody,
  Button,
  Divider,
} from "@nextui-org/react";
import { FaCamera, FaTrash } from "react-icons/fa";

type Props = {
  onDelete: () => void;
  onPhotoUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => void;
};

export const SettingsTab = ({ onDelete, onPhotoUpload }: Props) => {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Group Settings</h3>

      <Card className="mb-4">
        <CardBody className="space-y-6">
          {/* Photo Uploads */}
          <div>
            <h4 className="text-lg font-medium mb-2">Group Photos</h4>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <p className="text-sm text-default-500">Profile Picture</p>
                <label className="cursor-pointer">
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    startContent={<FaCamera />}
                    onPress={() =>
                      document.getElementById("profile-pic-input")?.click()
                    }
                  >
                    Change Profile
                  </Button>
                  <input
                    id="profile-pic-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPhotoUpload(e, "profile")}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-default-500">Cover Photo</p>
                <label className="cursor-pointer">
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                    startContent={<FaCamera />}
                    onPress={() =>
                      document.getElementById("cover-pic-input")?.click()
                    }
                  >
                    Change Cover
                  </Button>
                  <input
                    id="cover-pic-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPhotoUpload(e, "cover")}
                  />
                </label>
              </div>
            </div>
          </div>

          <Divider />

          {/* Danger Zone */}
          <div>
            <h4 className="text-lg font-medium mb-2">Danger Zone</h4>
            <Button
              color="danger"
              variant="flat"
              startContent={<FaTrash />}
              onPress={onDelete}
            >
              Delete This Group
            </Button>
            <p className="text-xs text-default-500 mt-2">
              This action cannot be undone. All group data will be permanently
              deleted.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};