import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Dialog, Flex, Text, TextField, Badge, IconButton } from "@radix-ui/themes";
import { X } from "lucide-react";
import { AppDispatch, RootState } from "../../store/Store";
import {
  fetchProductCategories,
  createProductCategory,
  updateProductCategory,
  removeProductCategory,
  permanentDeleteProductCategory,
  clearProductCategoriesError,
} from "../../features/ProductCategoriesSlice";
import DynamicAlertDialog from "../../components/dynamicComponents/DynamicAlertDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ManageCategoriesDialog({ open, onOpenChange }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (s: RootState) => s.productCategories
  );
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(clearProductCategoriesError());
      dispatch(fetchProductCategories({ includeInactive: true }));
    }
  }, [open, dispatch]);

  const handleClose = (next: boolean) => {
    if (!next) {
      dispatch(fetchProductCategories({ includeInactive: false }));
      setLabel("");
      setSlug("");
    }
    onOpenChange(next);
  };

  const handleCreate = async () => {
    if (!label.trim()) return;
    setSaving(true);
    try {
      await dispatch(
        createProductCategory({
          label: label.trim(),
          slug: slug.trim() || undefined,
        })
      ).unwrap();
      setLabel("");
      setSlug("");
    } catch {
      /* slice sets error */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content maxWidth="480px" aria-describedby={undefined}>
        <Flex justify="between" align="start" gap="3" mb="2" style={{ position: "relative" }}>
          <Dialog.Title style={{ margin: 0, flex: 1, paddingRight: 8 }}>
            Product categories
          </Dialog.Title>
          <Dialog.Close asChild>
            <IconButton
              type="button"
              variant="ghost"
              color="gray"
              size="2"
              aria-label="Close"
              style={{ flexShrink: 0, marginTop: -4 }}
            >
              <X size={20} />
            </IconButton>
          </Dialog.Close>
        </Flex>
        <Text size="2" color="gray" style={{ display: "block", marginBottom: 12 }}>
          <strong>Remove</strong> hides a category from pickers. <strong>Delete</strong> (on hidden
          categories) removes it forever if no products use that category. Products keep their
          saved slug until you edit them.
        </Text>

        {error && (
          <Text size="2" color="red" style={{ marginBottom: 8 }}>
            {error}
          </Text>
        )}

        <Flex direction="column" gap="3" mb="4">
          <Text weight="medium" size="2">
            New category
          </Text>
          <TextField.Root
            placeholder="Name (e.g. Coffee)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <TextField.Root
            placeholder="Slug (optional, e.g. coffee)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <Button
            onClick={handleCreate}
            disabled={saving || !label.trim() || loading}
          >
            {saving ? "Saving…" : "Add category"}
          </Button>
        </Flex>

        <Text weight="medium" size="2" style={{ marginBottom: 8 }}>
          All categories
        </Text>
        <Flex
          direction="column"
          gap="2"
          style={{ maxHeight: 280, overflowY: "auto" }}
        >
          {loading && categories.length === 0 ? (
            <Text size="2" color="gray">
              Loading…
            </Text>
          ) : (
            categories.map((c) => (
              <Flex
                key={c._id}
                align="center"
                justify="between"
                gap="3"
                p="2"
                style={{
                  borderRadius: 8,
                  border: "1px solid var(--gray-4)",
                }}
              >
                <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                  <Text weight="medium" size="2" style={{ wordBreak: "break-word" }}>
                    {c.label}
                  </Text>
                  <Text size="1" color="gray">
                    {c.slug}
                  </Text>
                </Flex>
                <Flex
                  align="center"
                  gap="2"
                  wrap="wrap"
                  justify="end"
                  style={{ flexShrink: 0, maxWidth: "100%" }}
                >
                  {c.isActive ? (
                    <Badge color="green">Active</Badge>
                  ) : (
                    <Badge color="gray">Hidden</Badge>
                  )}
                  {c.isActive ? (
                    <Button
                      size="1"
                      variant="soft"
                      color="red"
                      onClick={() =>
                        dispatch(removeProductCategory(c._id))
                      }
                    >
                      Remove
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="1"
                        variant="soft"
                        onClick={() =>
                          dispatch(
                            updateProductCategory({ id: c._id, isActive: true })
                          )
                        }
                      >
                        Restore
                      </Button>
                      <DynamicAlertDialog
                        title="Delete category permanently?"
                        description={`This will permanently remove "${c.label}" (${c.slug}). You can only delete if no products use this category.`}
                        cancelText="Cancel"
                        actionText="Delete"
                        color="red"
                        onAction={async () => {
                          await dispatch(
                            permanentDeleteProductCategory(c._id)
                          ).unwrap();
                        }}
                      >
                        <Button size="1" variant="solid" color="red">
                          Delete
                        </Button>
                      </DynamicAlertDialog>
                    </>
                  )}
                </Flex>
              </Flex>
            ))
          )}
        </Flex>

        <Flex justify="end" gap="2" mt="4">
          <Button variant="soft" color="gray" onClick={() => handleClose(false)}>
            Cancel
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
