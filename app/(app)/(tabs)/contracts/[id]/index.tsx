import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useBiometricGate } from "@/hooks/useBiometricGate";
import { formatDate } from "@/lib/format";
import { contractFilesService } from "@/services/contract-files";
import { contractsService } from "@/services/contracts";
import { ContractFile, ContractWithRelations } from "@/types/database";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

function statusLabel(status: string) {
  return status === "active" ? "Aktīvs" : "Beidzies";
}

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { requestApproval } = useBiometricGate();

  const [contract, setContract] = useState<ContractWithRelations | null>(null);
  const [file, setFile] = useState<ContractFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [c, f] = await Promise.all([
        contractsService.getById(id),
        contractFilesService.getByContract(id),
      ]);
      setContract(c);
      setFile(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kļūda ielādē.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onAddFile = async () => {
    if (!user) return;
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];

    setBusy(true);
    try {
      const newFile = await contractFilesService.upload({
        contractId: id,
        userId: user.id,
        localUri: asset.uri,
        fileName: asset.name,
      });
      setFile(newFile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Augšupielāde neizdevās.");
    } finally {
      setBusy(false);
    }
  };

  const onViewFile = async () => {
    if (!file) return;
    setError(null);
    const gate = await requestApproval(
      "Apstipriniet ar biometriju, lai apskatītu līguma failu",
    );
    if (!gate.success) {
      setError(gate.reason ?? "Apstiprinājums nav saņemts.");
      return;
    }
    router.push(`/(app)/(tabs)/contracts/${id}/view-file`);
  };

  const onDeleteFile = () => {
    if (!file) return;
    Alert.alert("Dzēst līguma failu?", "Šī darbība ir neatgriezeniska.", [
      { text: "Atcelt", style: "cancel" },
      {
        text: "Dzēst",
        style: "destructive",
        onPress: async () => {
          setError(null);
          const gate = await requestApproval(
            "Apstipriniet ar biometriju, lai dzēstu līguma failu",
          );
          if (!gate.success) {
            setError(gate.reason ?? "Apstiprinājums nav saņemts.");
            return;
          }
          setBusy(true);
          try {
            await contractFilesService.remove(file);
            setFile(null);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Kļūda dzēšot.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const onDeleteContract = () => {
    Alert.alert(
      "Dzēst līgumu?",
      "Šī darbība ir neatgriezeniska. Pievienotais fails arī tiks dzēsts.",
      [
        { text: "Atcelt", style: "cancel" },
        {
          text: "Dzēst",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              if (file) {
                await contractFilesService.remove(file);
              }
              await contractsService.remove(id);
              router.back();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Kļūda dzēšot.");
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <ScreenHeader showBack />
        <LoadingIndicator />
      </ScreenContainer>
    );
  }

  if (!contract) {
    return (
      <ScreenContainer>
        <ScreenHeader showBack title="Līgums" />
        <ErrorBanner message="Līgums nav atrasts." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        showBack
        title="Līgums"
        rightIcons={[
          {
            icon: "edit-2",
            accessibilityLabel: "Rediģēt",
            onPress: () => router.push(`/(app)/(tabs)/contracts/${id}/edit`),
            disabled: busy,
          },
          {
            icon: "trash-2",
            accessibilityLabel: "Dzēst",
            variant: "destructive",
            onPress: onDeleteContract,
            disabled: busy,
          },
        ]}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} />

        <View style={styles.fields}>
          <Field label="Īpašums" value={contract.property?.name} />
          <Field label="Īrnieks" value={contract.tenant?.full_name} />
          <Field label="Statuss" value={statusLabel(contract.status)} />
          <Field
            label="Sākuma datums"
            value={formatDate(contract.start_date)}
          />
          <Field
            label="Beigu datums"
            value={contract.end_date ? formatDate(contract.end_date) : null}
          />
        </View>

        <Text style={styles.sectionTitle}>Līguma fails</Text>
        <View style={styles.fileBox}>
          {file ? (
            <>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.file_name}
                </Text>
                <Text style={styles.fileMeta}>
                  Augšupielādēts {formatDate(file.uploaded_at)}
                </Text>
              </View>
              <View style={styles.fileActions}>
                <Button
                  label="Apskatīt failu"
                  onPress={onViewFile}
                  loading={busy}
                />
                <Button
                  label="Dzēst failu"
                  variant="destructive"
                  onPress={onDeleteFile}
                  disabled={busy}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.emptyFile}>Failu nav.</Text>
              <Button
                label="Pievienot PDF failu"
                variant="secondary"
                onPress={onAddFile}
                loading={busy}
              />
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fields: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fileBox: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  fileInfo: {
    gap: 4,
  },
  fileName: {
    fontSize: 16,
    color: "#000",
  },
  fileMeta: {
    fontSize: 13,
    color: "#666",
  },
  fileActions: {
    gap: 8,
    marginTop: 4,
  },
  emptyFile: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
});
